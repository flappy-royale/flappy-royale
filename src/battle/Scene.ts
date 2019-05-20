import * as Phaser from "phaser"
import * as Seed from "seed-random"
import * as _ from "lodash"
import * as constants from "../constants"

import { PlayerEvent, FirebaseDataStore, PlayerData } from "../firebase"
import { preloadBackgroundSprites, bgUpdateTick, createBackgroundSprites } from "./Background"
import { addRowOfPipes, preloadPipeSprites, pipeOutOfBoundsCheck, nudgePipesOntoPixelGrid } from "./PipeManager"
import { BirdSprite, preloadBirdSprites, setupBirdAnimations } from "./BirdSprite"
import { addScoreLine } from "./scoreLine"
import { enablePhysicsLogging } from "./debugging/enablePhysicsLogging"
import { createBus, busCrashed } from "./utils/createBus"
import { setupDeveloperKeyboardShortcuts } from "./debugging/keyboardShortcut"
import { BattleAnalytics } from "./utils/battleAnalytics"
import { recordGamePlayed } from "../user/userManager"

interface SceneSettings {
    seed: string
}

const devSettings = {
    // Turn off for release builds
    developer: true,
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
    // Used for determining what opponents to grab
    apiVersion: string = "1"

    /** The starting bus */
    bus: Phaser.Physics.Arcade.Image

    /** Your sprite */
    bird: BirdSprite

    /** opponent */
    ghostBirds: BirdSprite[] = []

    /** Every pipe is a set of physics objects */
    pipes: Phaser.Physics.Arcade.Group[]

    /** All the current scorelines on screen */
    scoreLines: Phaser.Physics.Arcade.Image[]

    /** A timer for generating new pipes */
    newPipeTimer: Phaser.Time.TimerEvent

    /** Keeping track of events from the user, sent up later */
    userInput: PlayerEvent[] = []

    /** Other players input events */
    recordedInput: PlayerData[] = []

    /** A place to grab user data from */
    dataStore: FirebaseDataStore

    /**  Number of MS to record the latest y-position */
    syncInterval = 400

    /* Scene timestamp for when the most recent round started
     * So recording timestamps can be consistent */
    timestampOffset: number = 0

    /** When we last stored a "sync" data point for the user.
     * This is the number of ms since the scene started, not since the round started */
    lastSyncedTimestamp = 0

    /** Developer logging */
    debugLabel: Phaser.GameObjects.Text

    /** A seed for the RNG function */
    seed: string

    /** The RNG function for this current run, and all ghosts*/
    rng: () => number

    /** Track spacebar keypresses to flap */
    spacebar: Phaser.Input.Keyboard.Key

    // See debugging/keyboardShortcuts.ts
    devKeys: object

    // What score did someone just get
    score: number

    /** How we show your score */
    scoreLabel: Phaser.GameObjects.Text

    // Analytics state management
    analytics: BattleAnalytics

    constructor(opts?: SceneSettings) {
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
        this.seed = (opts && opts.seed) || "123456789"
    }

    init(data: FirebaseDataStore) {
        this.dataStore = data
        this.apiVersion = this.dataStore.apiVersion
        this.resetGame()

        if (!canRecordScore()) {
            console.log("Not recording inputs, because a dev option is set")
        }

        window.addEventListener("touchstart", () => {
            this.userFlap()
        })
    }

    preload() {
        this.load.image("invis", "assets/InvisiblePX.png")
        this.load.image("bus", "assets/Bus.png")

        preloadPipeSprites(this)
        preloadBirdSprites(this)
        preloadBackgroundSprites(this)
    }

    create() {
        if (devSettings.debugPhysics) {
            enablePhysicsLogging(this)
        }

        // setup bg + animations
        createBackgroundSprites(this)
        setupBirdAnimations(this)

        // If there's a datastore of recorded inputs, then make a fresh clone of those
        if (this.dataStore && this.dataStore.data) {
            this.recordedInput = _.cloneDeep(this.dataStore.data[this.seed] || [])
        }

        this.bus = createBus(this)

        // Set up the competitor birds
        this.recordedInput.forEach(_ => {
            const ghost = new BirdSprite(this, constants.birdXPosition, constants.birdYPosition, false)
            ghost.setupForBeingInBus()
            this.ghostBirds.push(ghost)
        })

        if (this.bird) {
            this.bird.destroy()
        }

        this.bird = new BirdSprite(this, constants.birdXPosition, constants.birdYPosition, true)
        this.bird.setupForBeingInBus()

        this.time.delayedCall(
            800,
            () =>
                this.time.addEvent({
                    delay: constants.pipeTime, // We want 60px difference
                    callback: () => this.addPipe(),
                    callbackScope: this,
                    loop: true
                }),
            [],
            this
        )

        this.debugLabel = this.add.text(10, 200, "", { fontFamily: "PT Mono", fontSize: "12px" })
        this.debugLabel.setDepth(constants.zLevels.debugText)

        this.scoreLabel = this.add.text(80, 20, "", {
            fontFamily: "PT Mono",
            fontSize: "18px",
            align: "center",
            color: "white",
            stroke: "#000",
            strokeThickness: 2
        })
        this.scoreLabel.setDepth(constants.zLevels.debugText)

        // On spacebar bounce the bird
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        if (devSettings.developer) {
            this.devKeys = setupDeveloperKeyboardShortcuts(this)
        }

        // Keep track of stats for using later
        this.analytics.startRecording(this)
    }

    addPipe() {
        this.pipes.push(addRowOfPipes(181, this))
        this.scoreLines.push(addScoreLine(181, this, this.bird))
    }

    update(timestamp: number) {
        //this.bird.preUpdate()
        //this.ghostBirds.forEach(b => b.preUpdate())

        // Parallax stuff, and moves the ground to the front
        bgUpdateTick()

        // Just applying velocity, pipes have non-integer X values, which causes them to jiggle
        // Naively rounding their x-values down to the nearest int seeems to work,
        // although could cause unexpected issues?
        nudgePipesOntoPixelGrid(this.pipes)

        // The time from the start of a run
        const adjustedTime = Math.round(timestamp - this.timestampOffset)
        // record a sync of the users y position every so often, so that
        // we can make sure that the y positions are consistent with the ghosts
        if (timestamp - this.lastSyncedTimestamp >= this.syncInterval) {
            this.userInput.push({
                action: "sync",
                timestamp: adjustedTime,
                value: Math.round(this.bird.position.y)
            })
            this.lastSyncedTimestamp = timestamp
        }

        // Flap if appropriate
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.userFlap()
        }

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
                }
            }
        })

        // If the bird hits the floor
        if (!devSettings.skipBottomCollision && this.bird.position.y > 160 + 20) {
            this.userDied()
        }

        if (this.bird.position.x > 160) {
            this.userDied()
        }

        // The collision of your bird and the pipes
        if (!devSettings.skipPipeCollision) {
            this.bird.checkCollision(this, this.pipes, this.userDied)
        }

        // Score points by checking whether you got halfway
        this.bird.checkCollision(this, this.scoreLines, this.userScored)

        // Let the bus collide
        this.physics.overlap(this.bus, this.pipes, busCrashed, null, this)

        pipeOutOfBoundsCheck(this.pipes)

        if (this.isRecording()) {
            this.debug("Recording ghost")
        }
    }

    userFlap() {
        this.userInput.push({ action: "flap", timestamp: this.time.now - this.timestampOffset })

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
        const hasJumped = this.userInput.length > 4
        if (this.isRecording() && hasJumped) {
            const name = window.location.hash.slice(1)
            this.dataStore.storeForSeed(this.seed, {
                name: name,
                score: 0,
                apiVersion: this.apiVersion,
                actions: this.userInput
            })
        }

        this.restartTheGame()
    }

    resetGame() {
        this.rng = Seed(this.seed)
        this.userInput = []
        this.ghostBirds = []
        this.pipes = []
        this.scoreLines = []
        this.score = 0
    }

    restartTheGame() {
        this.timestampOffset = this.time.now
        this.time.update(0, 0)
        this.resetGame()
        this.scene.restart()
    }

    isRecording() {
        return canRecordScore() && this.dataStore && window.location.hash !== ""
    }

    debug(msg: string) {
        if (devSettings.debugMessages) {
            this.debugLabel.setText(msg)
        }
    }
}

// Devs should never be recording when they can wrap through the floor or pipes
const canRecordScore = () => {
    return !devSettings.skipBottomCollision && !devSettings.skipPipeCollision
}
