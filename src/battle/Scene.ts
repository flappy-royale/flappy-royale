import * as Phaser from "phaser"
import * as Seed from "seed-random"
import * as _ from "lodash"
import * as constants from "../constants"

import { PlayerEvent, FirebaseDataStore, PlayerData } from "../firebase"
import { preloadBackgroundSprites, bgUpdateTick, createBackgroundSprites } from "./Background"
import { addRowOfPipes, preloadPipeSprites, pipeOutOfBoundsCheck } from "./PipeManager"
import { addBirdToScene, BirdSprite, preloadBirdSprites, setupBirdAnimations } from "./BirdSprite"

interface SceneSettings {
    seed: string
}

const devSettings = {
    // Allows flying through pipes
    skipPipeCollision: false,
    // Allows falling off the bottom
    skipBottomCollision: true,
    // Events + info
    debugMessages: true
}

export class BattleScene extends Phaser.Scene {
    // Used for determining what opponents to grab
    apiVersion: string = "1"

    /** Your sprite  */
    bird: BirdSprite

    /** opponent */
    ghostBirds: BirdSprite[] = []

    /**  Every pipe is a set of physics objects */
    pipes: Phaser.Physics.Arcade.Group[]

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

    /** A seed for the RNG function */
    seed: string

    /** The RNG function for this current run, and all ghosts*/
    rng: () => number

    constructor(opts: SceneSettings) {
        super({
            key: "GameScene"
        })

        this.seed = (opts && opts.seed) || "123456"
        this.resetGame()

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
        preloadPipeSprites(this)
        preloadBirdSprites(this)
        preloadBackgroundSprites(this)
    }

    userFlap() {
        this.userInput.push({ action: "flap", timestamp: this.time.now - this.timestampOffset })
        this.bird.flap()
    }

    create() {
        // setup bg + animations
        createBackgroundSprites(this)
        setupBirdAnimations(this)

        // Setup your bird's initial position
        this.bird = addBirdToScene(constants.birdXPosition, 80, this)

        // If there's a datastore of recorded inputs, then make a fresh clone of those
        if (this.dataStore && this.dataStore.data) {
            this.recordedInput = _.cloneDeep(this.dataStore.data[this.seed] || [])
        }

        // Set up the competitor birds
        this.recordedInput.forEach(_ => {
            const ghost = addBirdToScene(constants.birdXPosition, 80, this)
            ghost.setAlpha(0.3)

            this.ghostBirds.push(ghost)
        })

        // On spacebar bounce the bird
        var keyObj = this.input.keyboard.addKey("SPACE")
        keyObj.on("down", this.userFlap, this)

        this.time.addEvent({
            delay: constants.pipeTime, // We want 60px difference
            callback: () => {
                this.pipes.push(addRowOfPipes(this))
            },
            callbackScope: this,
            loop: true
        })

        this.pipes.push(addRowOfPipes(this))
    }

    update(timestamp: number) {
        // Parallax stuff, and moves the ground to the front
        bgUpdateTick()

        const adjustedTime = timestamp - this.timestampOffset
        // record a sync of the users y position every so often, so that
        // we can make sure that the y positions are consistent with the ghosts
        if (adjustedTime - this.lastSyncedTimestamp >= this.syncInterval) {
            this.userInput.push({
                action: "sync",
                timestamp: adjustedTime,
                value: this.bird.body.position.y
            })
            this.lastSyncedTimestamp = adjustedTime
        }

        this.recordedInput.forEach((input, index) => {
            if (!input.actions) {
                return
            }

            while (input.actions.length > 0 && input.actions[0].timestamp < adjustedTime) {
                const action = input.actions.shift()
                const ghostBird = this.ghostBirds[index]
                if (action.action === "flap") {
                    ghostBird.flap()
                } else if (action.action === "sync" && action.value !== undefined) {
                    ghostBird.body.position.y = action.value
                } else if (action.action === "died") {
                    ghostBird.die()
                }
            }
        })

        // If the bird hits the floor
        if (!devSettings.skipBottomCollision && this.bird.y > 160 + 20) {
            this.userDied()
        }

        // The collision of your bird and the pipes
        if (!devSettings.skipPipeCollision) {
            this.physics.overlap(this.bird, this.pipes, this.userDied, null, this)
        }

        pipeOutOfBoundsCheck(this.pipes)
    }

    userDied() {
        // in the future we'll want to show the death animation etc
        this.userInput.push({
            action: "died",
            timestamp: this.time.now - this.timestampOffset
        })

        if (canRecordScore() && window.location.hash !== "" && this.userInput.length > 4) {
            const name = window.location.hash.slice(1)
            this.dataStore.storeForSeed(this.seed, {
                name: name,
                apiVersion: this.apiVersion,
                actions: this.userInput
            })
        }

        console.log(JSON.stringify(this.userInput, null, 2))
        this.restartTheGame()
    }

    resetGame() {
        this.rng = Seed(this.seed)
        this.userInput = []
        this.ghostBirds = []
        this.pipes = []
    }

    restartTheGame() {
        this.timestampOffset = this.time.now
        this.time.update(0, 0)
        this.resetGame()
        this.scene.restart()
    }
}

const canRecordScore = () => {
    return !devSettings.skipBottomCollision && !devSettings.skipPipeCollision
}

const stringFromDevSettings = () => {
    return `walls: ${devSettings.skipBottomCollision}, floor: ${devSettings.skipBottomCollision}`
}
