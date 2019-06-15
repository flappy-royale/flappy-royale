import * as Phaser from "phaser"
import * as Seed from "seed-random"
import * as constants from "../constants"
import * as game from "./utils/gameMode"

import { PlayerEvent, PlayerData, SeedData, uploadReplayForSeed } from "../firebase"
import { preloadBackgroundSprites, bgUpdateTick, createBackgroundSprites } from "./Background"
import { addRowOfPipes, preloadPipeSprites, pipeOutOfBoundsCheck, nudgePipesOntoPixelGrid } from "./PipeManager"
import { BirdSprite, preloadBirdSprites, setupBirdAnimations } from "./BirdSprite"
import { addScoreLine } from "./scoreLine"
import { enablePhysicsLogging } from "./debugging/enablePhysicsLogging"
import { createBus, busCrashed, preloadBusImages } from "./utils/createBus"
import { setupDeveloperKeyboardShortcuts } from "./debugging/keyboardShortcut"
import { BattleAnalytics } from "./utils/battleAnalytics"
import {
    recordGamePlayed,
    getUserSettings,
    subtractALife,
    getLives,
    getHighScore,
    setHighScore,
    livesExtensionStateForSeed
} from "../user/userManager"
import { launchMainMenu } from "../menus/MainMenuScene"
import { RoyaleDeath, deathPreload } from "./overlays/RoyaleDeathScene"
import { becomeButton } from "../menus/utils/becomeButton"
import { cloneDeep } from "lodash"
import { rightAlignTextLabel } from "./utils/alignTextLabel"
import { TrialDeath } from "./overlays/TrialDeathScene"
import { analyticsEvent } from "../nativeComms/analytics"

export interface BattleSceneSettings {
    /** The string representation for the level */
    seed: string
    /** The data from firebase */
    data: SeedData
    /** Game mode */
    gameMode: game.GameMode
    /** a UUID for the game scene  */
    key?: string
}

const devSettings = {
    // Turn off for release builds
    developer: constants.isInDevMode,
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
    public score: number

    // What the player's current high score for this seed is
    public highScore: number = 0

    /** How we show your score */
    private scoreLabel: Phaser.GameObjects.BitmapText | undefined

    /** How we show your daily high score in Trial */
    private highScoreLabel: Phaser.GameObjects.BitmapText | undefined

    /** Where we tell you how many are left */
    private birdsLeft: Phaser.GameObjects.BitmapText | undefined

    /** What you see to go back, hides on dying in a royale */
    private backButton: Phaser.GameObjects.Image | undefined

    /**  Analytics state management */
    private analytics: BattleAnalytics

    /** What game mode is this scene running in? */
    public mode: game.GameMode

    /** The thing that represents the floor (birds/the bus sit on this) */
    public floorPhysics: Phaser.Physics.Arcade.Image

    constructor(opts: BattleSceneSettings) {
        super(
            Object.assign(
                {
                    key: "GameScene" + opts.seed,
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

        const flap = this.userFlap.bind(this)
        window.addEventListener("touchstart", flap)

        this.events.on("destroy", () => {
            window.removeEventListener("touchstart", flap)
        })
    }

    preload() {
        this.load.image("invis", require("../../assets/InvisiblePX.png"))
        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )

        preloadBusImages(this)
        preloadPipeSprites(this)
        preloadBirdSprites(this)
        preloadBackgroundSprites(this)
        deathPreload(this)

        this.load.image("back-button", require("../../assets/menu/Back2.png"))

        this.load.audio("flap", require("../../assets/audio/flap.wav"))
        this.load.audio("hit", require("../../assets/audio/hit.wav"))
        this.load.audio("point", require("../../assets/audio/point.wav"))

        this.load.audio("other_flap", require("../../assets/audio/other_flap.wav"))
        this.load.audio("other_hit", require("../../assets/audio/other_hit.wav"))

        this.load.audio("crash", require("../../assets/audio/crash.wav"))
        this.load.audio("win", require("../../assets/audio/win.wav"))
    }

    create() {
        this.sound.add("flap")
        this.sound.add("hit")
        this.sound.add("point")

        this.sound.add("other_flap")
        this.sound.add("other_hit")

        this.sound.add("crash")
        this.sound.add("win")

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
            this.recordedInput = cloneDeep(this.seedData.replays || [])
        }

        this.bus = createBus(this)

        this.physics.add.collider(this.bus, this.floorPhysics)

        // Set up the competitor birds
        this.recordedInput.forEach(input => {
            const ghost = new BirdSprite(
                this,
                constants.birdXPosition,
                constants.birdYPosition + constants.GameAreaTopOffset,
                {
                    isPlayer: false,
                    settings: input.user
                }
            )
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
            this.bird = new BirdSprite(
                this,
                constants.birdXPosition,
                constants.birdYPosition + constants.GameAreaTopOffset,
                birdConfig
            )

            this.bird.setupForBeingInBus()
            this.bird.addCollideForSprite(this, this.floorPhysics)

            // On spacebar bounce the bird
            this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        }

        // This sets up a new pipe every x seconds
        const startPipeTimer = () => {
            if (this.bird && this.bird.isDead) return

            this.newPipeTimer = this.time.addEvent({
                delay: constants.pipeRepeatTime, // We want 60px difference
                callback: () => this.addPipe(),
                callbackScope: this,
                loop: true
            })
        }
        this.time.delayedCall(constants.timeBeforeFirstPipeLoads, startPipeTimer, [], this)

        this.debugLabel = this.add.text(10, 200 + constants.GameAreaTopOffset, "", {
            fontFamily: "PT Mono",
            fontSize: "12px"
        })
        this.debugLabel.setDepth(constants.zLevels.debugText)

        if (game.shouldShowScoreLabel(this.mode)) {
            this.scoreLabel = this.add.bitmapText(
                constants.GameWidth - 30,
                constants.GameAreaTopOffset,
                "nokia16",
                "0",
                32
            )
            this.scoreLabel.setRightAlign()
            this.scoreLabel.setDepth(constants.zLevels.ui)
            this.updateScoreLabel()
        }

        if (game.shouldShowLivesLabel(this.mode)) {
            const livesNum = getLives(this.seed)
            const lives = livesNum == 1 ? "last try!" : `${livesNum} tries left`
            const livesText = this.add.bitmapText(4, 22 + constants.GameAreaTopOffset, "nokia16", lives, 16)
            livesText.setDepth(constants.zLevels.ui)
        }

        if (game.shouldShowHighScoreLabel(this.mode)) {
            this.highScore = getHighScore(this.seed)
            let highScoreText = `Best: ${this.highScore}`
            this.highScoreLabel = this.add.bitmapText(
                constants.GameWidth - 60,
                constants.GameAreaTopOffset + 33,
                "nokia16",
                highScoreText,
                16
            )
            this.highScoreLabel.setRightAlign()
            this.highScoreLabel.setDepth(constants.zLevels.ui)
            rightAlignTextLabel(this.highScoreLabel, 2)
        }

        // When we want to show a countdown, set it up with defaults
        if (game.shouldShowBirdsLeftLabel(this.mode)) {
            this.birdsLeft = this.add.bitmapText(4, 4 + constants.GameAreaTopOffset, "nokia16", "0", 16)
            this.birdsLeft.setDepth(constants.zLevels.ui)
            this.ghostBirdHasDied()
        }

        if (devSettings.developer) {
            this.devKeys = setupDeveloperKeyboardShortcuts(this)
        }

        // Keep track of stats for using later
        this.analytics.startRecording({ totalBirds: this.ghostBirds.length, mode: this.mode })

        if (this.mode !== game.GameMode.Menu) {
            const back = this.add.image(16, constants.GameHeight - 20, "back-button").setInteractive()
            becomeButton(back, this.goBackToMainMenu, this)

            back.setDepth(constants.zLevels.ui)
            this.backButton = back
        }
    }

    private goBackToMainMenu() {
        this.game.scene.remove(this)
        launchMainMenu(this.game)
    }

    updateScoreLabel() {
        this.scoreLabel.text = `${this.score}`
        rightAlignTextLabel(this.scoreLabel)

        if (this.highScoreLabel && this.score > this.highScore) {
            this.highScore = this.score
            this.highScoreLabel.text = `Best: ${this.highScore}`
            rightAlignTextLabel(this.highScoreLabel, 2)
            setHighScore(this.seed, this.highScore)
        }
    }

    setupPhysicsFloor() {
        /** the physics floor, so that the bus + bird can land on it */
        this.floorPhysics = this.physics.add.staticImage(
            0,
            constants.GameAreaHeight - 50 + constants.GameAreaTopOffset,
            "invis"
        )
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

    playBusCrash() {
        this.sound.play("crash")
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
                    ghostBird.position.y = event.value + constants.GameAreaTopOffset
                } else if (event.action === "died") {
                    // If the player isn't dead, then this
                    // bird will now be moving at the pipes speed
                    // off the screen
                    let pipeSpeed = constants.pipeSpeed
                    if (this.bird.isDead) pipeSpeed = 0

                    ghostBird.die(-1 * pipeSpeed)
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
                    value: Math.round(this.bird.position.y - constants.GameAreaTopOffset)
                })
                this.lastSyncedTimestamp = timestamp
            }

            // If the bird hits the floor
            if (!devSettings.skipBottomCollision && this.bird.position.y > 171 + constants.GameAreaTopOffset) {
                if (!this.bird.isDead) this.userDied()

                this.bird.hasHitFloor()
            }

            // If somehow they move to the edge fo the screen past pipes
            if (!this.bird.isDead && this.bird.position.x > constants.GameWidth) {
                this.userDied()
            }

            // The collision of your bird and the pipes
            if (!this.bird.isDead && !devSettings.skipPipeCollision) {
                this.bird.checkCollision(this, this.pipes, this.userDied)
            }

            // Score points by checking whether you got halfway
            this.bird.checkCollision(this, this.scoreLines, this.userScored)

            this.bird.updateRelatedSprites({ tight: false })
        }

        // Let the bus collide
        const busCrash = (bus: Phaser.Physics.Arcade.Sprite) => {
            busCrashed(bus, this)
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
            if (this.bird && this.bird.isDead) return

            const birdsAlive = this.ghostBirds.filter(b => !b.isDead).length
            if (birdsAlive) {
                this.birdsLeft.text = `${getNumberWithOrdinal(birdsAlive + 1)}`
            } else if (this.ghostBirds.length) {
                // You were actually against other folk
                this.birdsLeft.text = "1st"
                this.sound.play("win")
            } else {
                this.birdsLeft.text = "Solo"
            }
        }
    }

    userFlap() {
        // Trying to flap on the main menu is just silly!
        if (this.mode === game.GameMode.Menu) {
            return
        }

        // No dead birds flapping y'hear
        if (this.bird && this.bird.isDead) return

        // Give a delay of 1s so that your sprite is on-screen entirely
        const timestamp = Math.round(this.time.now - this.timestampOffset)
        if (timestamp < 1000) return

        this.userInput.push({ action: "flap", timestamp })

        this.bus.setDepth(constants.zLevels.playerBird - 1)
        this.bird.flap()
        this.analytics.flap()
    }

    userScored(_bird: Phaser.GameObjects.Sprite, line: Phaser.Physics.Arcade.Sprite) {
        this.scoreLines.shift()
        line.destroy()
        this.score++
        this.sound.play("point")
        this.updateScoreLabel()
    }

    userDied() {
        this.userInput.push({
            action: "died",
            timestamp: this.time.now - this.timestampOffset
        })

        const hasJumped = this.userInput.filter(ui => ui.action === "flap").length > 2
        const birdsAlive = this.ghostBirds.filter(b => !b.isDead)

        // Check if they did enough for us to record the run
        // in the future we'll want to show the death animation etc
        if (this.isRecording()) {
            // Store what happened
            this.analytics.finishRecording({ score: this.score, position: birdsAlive.length })
            recordGamePlayed(this.analytics.getResults())
            analyticsEvent("game-played", this.analytics.getResults())

            if (hasJumped) {
                this.debug("Uploading replay")
                const settings = getUserSettings()
                uploadReplayForSeed({
                    seed: this.seed,
                    uuid: settings.name,
                    version: constants.APIVersion,
                    mode: this.mode,
                    data: { user: settings, actions: this.userInput, timestamp: Date.now(), score: this.score }
                })
                    .then(a => a.json())
                    .then(r => console.log(r))
            }
        }

        if (game.usesLives(this.mode)) {
            // This is (currently) only in trial mode
            const newLives = subtractALife(this.seed)
            if (newLives === 0) {
                // TODO: Modal instead
                console.log("Out of lives :(")
            }
        }

        if (game.shouldRestartWhenPlayerDies(this.mode)) {
            console.log("Restarting!")
            // Currently only used for the non-exposed Training mode. Shrug.
            this.restartTheGame()
        } else {
            // Could be hitting this on a loop
            if (this.bird.isDead) return
            console.log("not in a loop")

            // Stop everything!
            this.cameras.main.shake(20, 0.1)
            // No more new pipes
            if (this.newPipeTimer) this.newPipeTimer.destroy()
            // Stop the pipes and scores from scrolling
            this.pipes.forEach(pg => pg && pg.setVelocity(0, 0, 0))
            this.scoreLines.forEach(sl => sl && sl.setVelocity(0, 0))

            // Make your bird go through the death animation
            this.bird.die()

            // Allow the other birds to continue off screen
            this.ghostBirds.forEach(b => !b.isDead && b.startMovingLeft())

            // Stop the bus from moving with the pipes
            this.bus.setVelocityX(0)

            // Remove the UI
            // TODO: Fade?
            this.scoreLabel.destroy()
            this.birdsLeft.destroy()
            this.backButton.destroy()

            if (this.mode === game.GameMode.Royale) {
                const deathOverlay = new RoyaleDeath("death", {
                    score: this.score,
                    position: birdsAlive.length,
                    battle: this,
                    totalPlayers: this.ghostBirds.length + 1
                })
                this.scene.add("deathoverlay", deathOverlay, true)
            } else if (this.mode === game.GameMode.Trial) {
                const deathOverlay = new TrialDeath("death", {
                    score: this.score,
                    lives: getLives(this.seed),
                    livesState: livesExtensionStateForSeed(this.seed),
                    position: birdsAlive.length,
                    battle: this,
                    totalPlayers: this.ghostBirds.length + 1,
                    seed: this.seed,
                    replays: this.seedData.replays
                })
                this.scene.add("deathoverlay", deathOverlay, true)
            }
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

    prepareForShutdown() {
        // if (this.spacebar) this.spacebar.destroy()
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

// https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number/13627586
export function getNumberWithOrdinal(n) {
    var s = ["th", "st", "nd", "rd"],
        v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
}
