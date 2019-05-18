import * as Phaser from "phaser"
import * as Seed from "seed-random"
import * as _ from "lodash"
import * as constants from "../constants"

import { PlayerEvent, FirebaseDataStore, PlayerData } from "../firebase"
import {
    preloadBackgroundSprites,
    createBehindPipeBackgroundSprites,
    createAfterPipeBackgroundSprites,
    bgUpdateTick
} from "./Background"
import { addRowOfPipes } from "./PipeManager"
import { addBirdToScene, BirdSprite } from "./BirdSprite"

interface SceneSettings {
    seed: string
}

export class BattleScene extends Phaser.Scene {
    // Used for determining what opponents to grab
    apiVersion: string = "1"

    /** Your sprite  */
    bird: BirdSprite

    /** opponent */
    ghostBirds: BirdSprite[] = []

    /**  Every piece of a pipe */
    pipes: Phaser.Physics.Arcade.Group

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

        this.seed = (opts && opts.seed) || "12345"
        this.resetGame()

        window.addEventListener("touchstart", () => {
            this.bird.flap()
        })
    }

    configureDataStore(dataStore: FirebaseDataStore) {
        this.dataStore = dataStore
        this.apiVersion = this.dataStore.apiVersion

        this.restartTheGame()
    }

    preload() {
        this.load.image("bird1", "assets/Bird1.png")
        this.load.image("bird2", "assets/Bird2.png")
        this.load.image("bird3", "assets/Bird3.png")
        this.load.image("pipe-top", "assets/PipeTop.png")
        this.load.image("pipe-body", "assets/PipeLength.png")
        this.load.image("pipe-bottom", "assets/PipeBottom.png")
        preloadBackgroundSprites(this)
    }

    create() {
        // setup bg
        createBehindPipeBackgroundSprites(this)

        this.anims.create({
            key: "flap",
            frames: [
                { key: "bird1", frame: 0 },
                { key: "bird2", frame: 1 },
                { key: "bird3", frame: 2 },
                { key: "bird2", frame: 3 }
            ],
            frameRate: 18,
            repeat: -1
        })

        this.anims.create({
            key: "dive",
            frames: [{ key: "bird2", frame: 0 }],
            frameRate: 0,
            repeat: -1
        })

        // Setup your bird's initial position
        this.bird = addBirdToScene(constants.birdXPosition, 80, "bird1", this)
        this.bird.setOrigin(0.13, 0.5)

        // this.bird.play('flap')

        if (this.dataStore && this.dataStore.data) {
            this.recordedInput = _.cloneDeep(this.dataStore.data[this.seed] || [])
        }

        this.ghostBirds = []

        this.recordedInput.forEach(_ => {
            const ghost = addBirdToScene(constants.birdXPosition, 80, "bird1", this)
            // ghost.setTint(Math.random() * 16000000);
            ghost.setAlpha(0.3)

            this.ghostBirds.push(ghost)
        })

        // On spacebar bounce the bird
        var keyObj = this.input.keyboard.addKey("SPACE")
        const inputs = this.userInput

        keyObj.on("down", (_event: KeyboardEvent) => {
            this.bird.flap()
            inputs.push({ action: "flap", timestamp: this.time.now - this.timestampOffset })
        })

        this.time.addEvent({
            delay: constants.pipeTime, // We want 60px difference
            callback: () => {
                addRowOfPipes(this)
            },
            callbackScope: this,
            loop: true
        })

        this.pipes = addRowOfPipes(this)

        // When anything reaches the edge of the world (e.g. the pipes, destroy them)
        this.physics.world.setBoundsCollision(true, false, false, false)
        this.physics.world.on("worldbounds", (body: Phaser.Physics.Arcade.Body) => {
            if (this.pipes.contains(body.gameObject)) {
                this.pipes.remove(body.gameObject, true, true)
            }
        })

        createAfterPipeBackgroundSprites(this)
    }

    update(timestamp: number) {
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
                if (action.action === "flap") {
                    this.ghostBirds[index].flap()
                } else if (action.action === "sync" && action.value !== undefined) {
                    this.ghostBirds[index].body.position.y = action.value
                }
            }
        })

        // If the bird hits the floor
        if (this.bird.y > 160 + 20) {
            this.restartTheGame()
        }

        // The collision of your bird and the pipes
        this.physics.overlap(this.bird, this.pipes, this.restartTheGame, null, this)
    }

    resetGame() {
        this.rng = Seed(this.seed)
        this.userInput = []
    }

    restartTheGame() {
        console.clear()
        console.log(JSON.stringify(this.userInput, null, 2))

        if (window.location.hash !== "" && this.userInput.length > 4) {
            const name = window.location.hash.slice(1)
            this.dataStore.storeForSeed(this.seed, {
                name: name,
                apiVersion: this.apiVersion,
                actions: this.userInput
            })
        }

        // this.timestampOffset = this.time.now
        this.time.update(0, 0)
        this.resetGame()
        this.scene.restart()
    }
}
