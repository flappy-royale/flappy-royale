import * as Phaser from "phaser"
import * as Seed from "seed-random"
import * as _ from "lodash"
import * as constants from "../constants"
import * as game from "./utils/gameMode"

import { PlayerEvent, PlayerData, SeedData, uploadReplayForSeed } from "../firebase"
import { preloadBackgroundSprites, bgUpdateTick, createBackgroundSprites } from "./Background"
import { addRowOfPipes, preloadPipeSprites, pipeOutOfBoundsCheck, nudgePipesOntoPixelGrid } from "./PipeManager"
import { BirdSprite, preloadBirdSprites, setupBirdAnimations } from "./BirdSprite"
import { addScoreLine } from "./scoreLine"
import { enablePhysicsLogging } from "./debugging/enablePhysicsLogging"
import { createBus, busCrashed } from "./utils/createBus"
import { setupDeveloperKeyboardShortcuts } from "./debugging/keyboardShortcut"
import { BattleAnalytics } from "./utils/battleAnalytics"
import { recordGamePlayed, getUserSettings } from "../user/userManager"

export interface BattleSceneSettings {
    /** The string representation for the level */
    seed: string
    /** The data from firebase */
    data: SeedData
    /** Game mode */
    gameMode: game.GameMode
}

const isInDevMode = document.location.port === "8085"

const devSettings = {
    // Turn off for release builds
    developer: isInDevMode,
    // Allows flying through pipes
    skipPipeCollision: false,
    // Allows falling off the bottom
    skipBottomCollision: false,
    // Show bounding boxes for physics objs
    debugPhysics: false,
    // Events + info
    debugMessages: true
}

export class BattleScene extends Phaser.Scene {
    /** The starting bus */
    private bus: Phaser.Physics.Arcade.Image

    /** Your sprite, or if behind the main menu - not set up for this game mode */
    private bird: BirdSprite | undefined

    /** opponent */
    private ghostBirds: BirdSprite[] = []

    /** Every pipe is a set of physics objects */
    private pipes: Phaser.Physics.Arcade.Group[]

    /** All the current scorelines on screen */
    private scoreLines: Phaser.Physics.Arcade.Image[]

    /** A timer for generating new pipes */
    private newPipeTimer: Phaser.Time.TimerEvent

    /** Keeping track of events from the user, sent up later */
    private userInput: PlayerEvent[] = []

    /** A seed for the RNG function */
    public seed: string

    /** The data (user recordings etc) for this seed  */
    public seedData: SeedData

    /** A copy (to be mutated) of the other players input events */
    private recordedInput: PlayerData[] = []

    /* Scene timestamp for when the most recent round started
     * So recording timestamps can be consistent */
    private timestampOffset: number = 0

    /** When we last stored a "sync" data point for the user.
     * This is the number of ms since the scene started, not since the round started */
    private lastSyncedTimestamp = 0

    /** Developer logging */
    private debugLabel: Phaser.GameObjects.Text

    /** The RNG function for this current run, pipes, and all ghosts */
    public rng: () => number

    /** Track spacebar keypresses to flap */
    private spacebar: Phaser.Input.Keyboard.Key

    // See debugging/keyboardShortcuts.ts
    public devKeys: object

    // What score did someone just get
    private score: number

    /** How we show your score */
    private scoreLabel: Phaser.GameObjects.BitmapText

    /** Where we tell you how many are left */
    private birdsLeft: Phaser.GameObjects.BitmapText

    /**  Analytics state management */
    private analytics: BattleAnalytics

    /** What game mode is this scene running in? */
    public mode: game.GameMode

    public floorPhysics: Phaser.Physics.Arcade.Image

    constructor(opts: BattleSceneSettings) {
        super(
            Object.assign(
                {
                    key: "GameScene",
                    active: false
                },
                opts
            )
        )

        this.analytics = new BattleAnalytics()
        this.seed = opts.seed
        this.seedData = opts.data
        this.mode = opts.gameMode
    }

    // This happens when the scene is being played by the game (more
    // like UIKit's viewDidLoad instead of the constructor)
    //
    init() {
        this.resetGame()

        if (!canRecordScore()) {
            console.log("Not recording inputs, because a dev option is set")
        }

        window.addEventListener("touchstart", () => {
            this.userFlap()
        })
    }

    preload() {
        this.load.image("invis", require("../../assets/InvisiblePX.png"))
        this.load.image("bus", require("../../assets/battle/Bus.png"))
        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )

        preloadPipeSprites(this)
        preloadBirdSprites(this)
        preloadBackgroundSprites(this)
    }

    create() {
        this.time.update(0, 0)

        // Fill the BG
        this.add.rectangle(
            constants.GameWidth / 2,
            constants.GameHeight / 2,
            constants.GameWidth,
            constants.GameHeight,
            0x62cbe0
        )

        if (devSettings.debugPhysics) {
            enablePhysicsLogging(this)
        }

        // setup bg + animations
        createBackgroundSprites(this)
        setupBirdAnimations(this)
        this.setupPhysicsFloor()

        // If there's a datastore of recorded inputs, then make a fresh clone of those
        if (this.seedData && this.seedData.replays) {
            this.recordedInput = _.cloneDeep(this.seedData.replays || [])
        }

        this.bus = createBus(this)

        // Set up the competitor birds
        this.recordedInput.forEach(input => {
            const ghost = new BirdSprite(this, constants.birdXPosition, constants.birdYPosition, {
                isPlayer: false,
                settings: input.user
            })
            ghost.setupForBeingInBus()
            ghost.addCollideForSprite(this, this.floorPhysics)
            this.ghostBirds.push(ghost)
        })

        if (this.bird) {
            this.bird.destroy()
        }

        if (game.showPlayerBird(this.mode)) {
            const settings = getUserSettings()
            const birdConfig = { isPlayer: true, settings }
            this.bird = new BirdSprite(this, constants.birdXPosition, constants.birdYPosition, birdConfig)
            this.bird.setupForBeingInBus()
            this.bird.addCollideForSprite(this, this.floorPhysics)

            // On spacebar bounce the bird
            this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        }

        // This sets up a new pipe every x seconds
        this.newPipeTimer = this.time.addEvent({
            startAt: 800,
            delay: constants.pipeTime, // We want 60px difference
            callback: () => this.addPipe(),
            callbackScope: this,
            loop: true
        })

        this.debugLabel = this.add.text(10, 200, "", { fontFamily: "PT Mono", fontSize: "12px" })
        this.debugLabel.setDepth(constants.zLevels.debugText)

        const { ALIGN_CENTER, ALIGN_RIGHT } = Phaser.GameObjects.BitmapText
        if (game.shouldShowScoreLabel(this.mode)) {
            this.scoreLabel = this.add.bitmapText(80, 20, "nokia16", "0", 0, ALIGN_CENTER)
            this.scoreLabel.setDepth(constants.zLevels.debugText)
        }

        // When we want to show a countdown, set it up with defaults
        if (game.shouldShowBirdsLeftLabel(this.mode)) {
            this.birdsLeft = this.add.bitmapText(constants.GameWidth - 40, 20, "nokia16", "0", 0, ALIGN_RIGHT)
            this.birdsLeft.setDepth(constants.zLevels.debugText)
            this.ghostBirdHasDied()
        }

        if (devSettings.developer) {
            this.devKeys = setupDeveloperKeyboardShortcuts(this)
        }

        // Keep track of stats for using later
        this.analytics.startRecording(this)
    }

    setupPhysicsFloor() {
        /** the physics floor, so that the bus + bird can land on it */
        this.floorPhysics = this.physics.add.staticImage(0, constants.GameHeight - 50, "invis")
        this.floorPhysics.setGravityY(-1 * constants.gravity)
        this.floorPhysics.body.setSize(constants.GameWidth, 20)
        this.floorPhysics.setBounce(0.3)
    }

    addPipe() {
        this.pipes.push(addRowOfPipes(181, this))

        // When we have a bird, add lines to score from
        if (game.showPlayerBird(this.mode)) {
            this.scoreLines.push(addScoreLine(181, this, this.bird))
        }
    }

    update(timestamp: number) {
        // Parallax stuff, and moves the ground to the front
        if (!this.bird || !this.bird.isDead) {
            bgUpdateTick()
        }

        // Just applying velocity, pipes have non-integer X values, which causes them to jiggle
        // Naively rounding their x-values down to the nearest int seems to work,
        // although could cause unexpected issues?
        nudgePipesOntoPixelGrid(this.pipes)

        // The time from the start of a run
        const adjustedTime = Math.round(timestamp - this.timestampOffset)

        // Flap if appropriate
        if (this.spacebar && Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.userFlap()
        }

        // Replay all of the actions for the other players
        this.recordedInput.forEach((input, index) => {
            if (!input.actions) {
                return
            }

            while (input.actions.length > 0 && input.actions[0].timestamp < adjustedTime) {
                const event = input.actions.shift()
                const ghostBird = this.ghostBirds[index]
                if (event.action === "flap") {
                    ghostBird.flap()
                } else if (event.action === "sync" && event.value !== undefined) {
                    ghostBird.position.y = event.value
                } else if (event.action === "died") {
                    ghostBird.die()
                    this.ghostBirdHasDied()
                }
            }
        })

        // Player related game logic
        if (game.showPlayerBird(this.mode)) {
            //
            // record a sync of the users y position every so often, so that
            // we can make sure that the y positions are consistent with the ghosts
            if (timestamp - this.lastSyncedTimestamp >= constants.timeBetweenYSyncs) {
                this.userInput.push({
                    action: "sync",
                    timestamp: adjustedTime,
                    value: Math.round(this.bird.position.y)
                })
                this.lastSyncedTimestamp = timestamp
            }

            // If the bird hits the floor
            if (!devSettings.skipBottomCollision && this.bird.position.y > 171) {
                if (!this.bird.isDead) {
                    this.userDied()
                }
                this.bird.hasHitFloor()
            }

            // If somehow they move to the edge fo the screen past pipes
            if (this.bird.position.x > constants.GameWidth) {
                this.userDied()
            }

            // The collision of your bird and the pipes
            if (!devSettings.skipPipeCollision) {
                this.bird.checkCollision(this, this.pipes, this.userDied)
            }

            // Score points by checking whether you got halfway
            this.bird.checkCollision(this, this.scoreLines, this.userScored)

            this.bird.updateRelatedSprites({ tight: false })
        }

        // Let the bus collide
        const busCrash = (bus: Phaser.Physics.Arcade.Sprite) => {
            busCrashed(bus)
            if (this.bird && this.bird.isInBus) {
                this.userDied()
            }
        }

        this.physics.overlap(this.bus, this.pipes, busCrash, null, this)

        pipeOutOfBoundsCheck(this.pipes)
    }

    ghostBirdHasDied() {
        if (game.shouldRestartWhenAllBirdsAreDead(this.mode)) {
            this.restartTheGame()
        } else {
            const birdsAlive = this.ghostBirds.filter(b => !b.isDead).length
            if (birdsAlive) {
                this.birdsLeft.text = `${birdsAlive + 1} left`
            } else {
                this.birdsLeft.text = "You won"
            }
        }
    }

    userFlap() {
        // No dead birds flapping y'hear
        if (this.bird && this.bird.isDead) return

        this.userInput.push({ action: "flap", timestamp: Math.round(this.time.now - this.timestampOffset) })

        this.bird.flap()
        this.analytics.flap()
    }

    userScored(_bird: Phaser.GameObjects.Sprite, line: Phaser.Physics.Arcade.Sprite) {
        this.scoreLines.shift()
        line.destroy()
        this.score++
        this.scoreLabel.text = `${this.score}`
    }

    userDied() {
        // in the future we'll want to show the death animation etc
        this.userInput.push({
            action: "died",
            timestamp: this.time.now - this.timestampOffset
        })

        // Store what happened
        const birdsAlive = this.ghostBirds.filter(b => !b.isDead)
        this.analytics.finishRecording({ score: this.score, position: birdsAlive.length })
        recordGamePlayed(this.analytics.getResults())

        // Check if they did enough for us to record the run
        const hasJumped = this.userInput.filter(ui => ui.action === "flap").length > 2
        if (this.isRecording() && hasJumped) {
            // TODO: Generate a UUID?
            this.debug("Uploading replay")
            const settings = getUserSettings()
            uploadReplayForSeed({
                seed: this.seed,
                uuid: settings.name,
                version: constants.APIVersion,
                data: { user: settings, actions: this.userInput, timestamp: Date.now(), score: this.score }
            })
                .then(a => a.json())
                .then(r => console.log(r))
        }

        if (game.shouldRestartWhenPlayerDies(this.mode)) {
            this.restartTheGame()
        } else {
            if (!this.bird.isDead) {
                this.cameras.main.shake(50, 0.1)
                this.newPipeTimer.destroy()
                this.pipes.forEach(pg => pg.setVelocity(0, 0, 0))
                this.scoreLines.forEach(pg => pg.setVelocity(0, 0))
                this.bird.die()
            }
            // Do something
        }
    }

    resetGame() {
        this.rng = Seed(this.seed)
        this.userInput = []
        this.ghostBirds = []
        this.pipes = []
        this.scoreLines = []
        this.score = 0
        this.timestampOffset = this.time.now
    }

    restartTheGame() {
        this.resetGame()
        this.scene.restart()
    }

    isRecording() {
        return canRecordScore() && game.shouldRecordScores(this.mode)
    }

    debug(msg: string) {
        if (devSettings.debugMessages) {
            console.log(msg)
        }
    }
}

// Devs should never be recording when they can wrap through the floor or pipes
const canRecordScore = () => {
    return !devSettings.skipBottomCollision && !devSettings.skipPipeCollision
}
