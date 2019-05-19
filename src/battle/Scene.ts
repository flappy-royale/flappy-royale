import * as Phaser from "phaser"
import * as Seed from "seed-random"
import * as _ from "lodash"
import * as constants from "../constants"

import { PlayerEvent, FirebaseDataStore, PlayerData } from "../firebase"
import { preloadBackgroundSprites, bgUpdateTick, createBackgroundSprites } from "./Background"
import { addRowOfPipes, preloadPipeSprites, pipeOutOfBoundsCheck, nudgePipesOntoPixelGrid } from "./PipeManager"
import { BirdSprite, preloadBirdSprites, setupBirdAnimations } from "./BirdSprite"
import { addScoreLine } from "./scoreLine"
import { enablePhysicsLogging } from "./utils/enablePhysicsLogging"
import { createBus, busCrashed } from "./utils/createBus"

interface SceneSettings {
    seed: string
}

const devSettings = {
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

    /** Your sprite  */
    bird: BirdSprite

    /** opponent */
    ghostBirds: BirdSprite[] = []

    /** Every pipe is a set of physics objects */
    pipes: Phaser.Physics.Arcade.Group[]

    /** All the current scorelines on screen */
    scoreLines: Phaser.Physics.Arcade.Image[]

    /** A timer for generating new pipes */
    newPipeTimer: Phaser.Time.TimerEvent

    /* So the scene can be re-used but time offsets can always be accurate */
    timestampOffset: number = 0

    /** Keeping track of events from the user, sent up later */
    userInput: PlayerEvent[] = []

    /** Other players input events */
    recordedInput: PlayerData[] = []

    /** A place to grab user data from */
    dataStore: FirebaseDataStore

    /**  Number of MS to record the latest y-position */
    syncInterval = 400

    /** When we last stored the timestamp */
    lastSyncedTimestamp = 0

    /** Developer logging */
    debugLabel: Phaser.GameObjects.Text

    /** A seed for the RNG function */
    seed: string

    /** The RNG function for this current run, and all ghosts*/
    rng: () => number

    /** Track spacebar keypresses to flap */
    spacebar: Phaser.Input.Keyboard.Key

    constructor(opts: SceneSettings) {
        super({
            key: "GameScene"
        })

        this.seed = (opts && opts.seed) || "12345678"
        this.resetGame()

        if (!canRecordScore()) {
            this.debug("Not recording inputs, because a dev option is set")
        }

        window.addEventListener("touchstart", () => {
            this.userFlap()
        })
    }

    configureDataStore(dataStore: FirebaseDataStore) {
        this.dataStore = dataStore
        this.apiVersion = this.dataStore.apiVersion

        this.restartTheGame()
    }

    preload() {
        this.load.image("invis", "assets/InvisiblePX.png")
        this.load.image("bus", "assets/Bus.png")

        preloadPipeSprites(this)
        preloadBirdSprites(this)
        preloadBackgroundSprites(this)
    }

    userFlap() {
        this.userInput.push({ action: "flap", timestamp: this.time.now - this.timestampOffset })

        this.bird.flap()
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
            ghost.isPlayer = false
            this.ghostBirds.push(ghost)
        })

        // Setup your bird's initial position
        this.bird = new BirdSprite(this, constants.birdXPosition, constants.birdYPosition, true)

        this.time.addEvent({
            delay: constants.pipeTime, // We want 60px difference
            callback: () => this.addPipe(),
            callbackScope: this,
            loop: true
        })

        this.debugLabel = this.add.text(10, 200, "", { fontFamily: "PT Mono", fontSize: "12px" })
        this.debugLabel.setDepth(constants.zLevels.debugText)

        // On spacebar bounce the bird
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    }

    addPipe() {
        this.pipes.push(addRowOfPipes(181, this))
        this.scoreLines.push(addScoreLine(181, this, this.bird))
    }

    update(timestamp: number) {
        this.bird.preUpdate()
        this.ghostBirds.forEach(b => b.preUpdate())

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
        if (adjustedTime - this.lastSyncedTimestamp >= this.syncInterval) {
            this.userInput.push({
                action: "sync",
                timestamp: adjustedTime,
                value: Math.round(this.bird.position.y)
            })
            this.lastSyncedTimestamp = adjustedTime
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

        // The collision of your bird and the pipes
        if (!devSettings.skipPipeCollision) {
            this.bird.checkCollision(this, this.pipes, this.userDied)
        }

        // Score points by checking whether you got halfway
        this.bird.checkCollision(this, this.scoreLines, this.userScored)

        // Let the bus collide
        this.physics.overlap(this.bus, this.pipes, busCrashed, null, this)

        pipeOutOfBoundsCheck(this.pipes)
    }

    userScored(_bird: Phaser.GameObjects.Sprite, line: Phaser.Physics.Arcade.Sprite) {
        this.scoreLines.shift()
        line.destroy()
    }

    userDied() {
        // in the future we'll want to show the death animation etc
        this.userInput.push({
            action: "died",
            timestamp: this.time.now - this.timestampOffset
        })

        const hasJumped = this.userInput.length > 4
        if (canRecordScore() && window.location.hash !== "" && hasJumped) {
            const name = window.location.hash.slice(1)
            this.dataStore.storeForSeed(this.seed, {
                name: name,
                apiVersion: this.apiVersion,
                actions: this.userInput
            })
        }

        if (hasJumped) {
            console.log(JSON.stringify(this.userInput, null, 2))
        }

        this.restartTheGame()
    }

    resetGame() {
        this.rng = Seed(this.seed)
        this.userInput = []
        this.ghostBirds = []
        this.pipes = []
        this.scoreLines = []
    }

    restartTheGame() {
        this.timestampOffset = this.time.now
        this.time.update(0, 0)
        this.resetGame()
        this.scene.restart()
    }

    debug(msg: string) {
        if (devSettings.debugMessages) {
            this.debugLabel.setText(msg)
        }
    }
}

const canRecordScore = () => {
    return !devSettings.skipBottomCollision && !devSettings.skipPipeCollision
}
