import * as Phaser from "phaser"
import * as constants from "../constants"
import * as game from "./utils/gameMode"

import { preloadBackgroundSprites, bgUpdateTick, createBackgroundSprites } from "./Background"
import { preloadPipeSprites, pipeOutOfBoundsCheck, nudgePipesOntoPixelGrid, addRowOfPipesManual } from "./PipeManager"
import { BirdSprite, preloadBirdSprites, setupBirdAnimations } from "./BirdSprite"
import { addScoreLine } from "./scoreLine"
import { busCrashed, preloadBusImages } from "./utils/createBus"
import { getUserSettings, UserSettings, changeSettings, completeTutorial } from "../user/userManager"
import { launchMainMenu } from "../menus/MainMenuScene"
import { deathPreload } from "./overlays/RoyaleDeathScene"
import { GameTheme, themeMap } from "./theme"
import { addScene } from "../menus/utils/addScene"
import { loadUpIntoSettings, FlappyGame } from "../app"

/** Used on launch, and when you go back to the main menu */
export const launchTutorial = (game: Phaser.Game) => {
    const scene = new TutorialScene()
    addScene(game, "TutorialScene", scene, true)
}

enum TutorialStep {
    InBus = 1,
    Flapping,
    Done
}

export class TutorialScene extends Phaser.Scene {
    /** The starting bus */
    private bus: Phaser.Physics.Arcade.Image

    /** Your sprite, or if behind the main menu - not set up for this game mode */
    private bird: BirdSprite | undefined

    /** Every pipe is a set of physics objects */
    private pipes: Phaser.Physics.Arcade.Group[]

    /** All the current scorelines on screen */
    private scoreLines: Phaser.Physics.Arcade.Image[]

    /** A timer for generating new pipes */
    private newPipeTimer: Phaser.Time.TimerEvent

    /* Scene timestamp for when the most recent round started
     * So recording timestamps can be consistent */
    private timestampOffset: number = 0

    /** Developer logging */
    private debugLabel: Phaser.GameObjects.Text

    /** The RNG function for this current run, pipes, and all ghosts */
    public rng: () => number

    /** Track spacebar keypresses to flap */
    private spacebar: Phaser.Input.Keyboard.Key

    /** What you see to go back, hides on dying in a royale */
    private backButton: Phaser.GameObjects.Image | undefined

    /** What game mode is this scene running in? */
    public mode: game.GameMode = game.GameMode.Tutorial

    /** How far along in the tutorial is the user */
    private tutorialStep: TutorialStep = TutorialStep.InBus

    public theme: GameTheme = GameTheme.default

    /** The thing that represents the floor (birds/the bus sit on this) */
    public floorPhysics: Phaser.Physics.Arcade.Image

    constructor(opts: any = {}) {
        super({
            ...opts,
            key: "TutorialScene"
        })
    }

    // This happens when the scene is being played by the game (more
    // like UIKit's viewDidLoad instead of the constructor)
    //
    init() {
        this.resetGame()

        const flap = this.userFlap.bind(this)
        window.addEventListener("touchstart", flap)
        window.addEventListener("mousedown", flap)

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
        preloadPipeSprites(this, this.theme)
        preloadBirdSprites(this)
        preloadBackgroundSprites(this, this.theme)
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
            themeMap[this.theme].bgColor
        )

        // setup bg + animations
        createBackgroundSprites(this, this.theme)
        setupBirdAnimations(this)
        this.setupPhysicsFloor()

        const bus = this.physics.add.sprite(-10, 40 + constants.GameAreaTopOffset, "bus")
        bus.setGravityY(-constants.gravity)
        bus.setAccelerationX(20)
        bus.setDepth(constants.zLevels.birdWings + 1)
        this.bus = bus

        // TODO: When the bus hits the middle of the screen, setAccelerationX(0)
        // After the user drops, send it away with gravity

        this.physics.add.collider(this.bus, this.floorPhysics)

        if (this.bird) {
            this.bird.destroy()
        }

        const settings = getUserSettings()
        const birdConfig = { isPlayer: true, settings }
        this.bird = new BirdSprite(
            this,
            constants.birdXPosition,
            constants.birdYPosition + constants.GameAreaTopOffset,
            birdConfig
        )

        this.bird.sprite.setGravityY(-constants.gravity)
        this.bird.sprite.setAccelerationX(20)

        this.bird.addCollideForSprite(this, this.floorPhysics)

        // On spacebar bounce the bird
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    }

    private goBackToMainMenu() {
        this.game.scene.remove(this)
        launchMainMenu(this.game)
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

    playBusCrash() {
        this.sound.play("crash")
    }

    update(timestamp: number) {
        // Parallax stuff, and moves the ground to the front
        if (!this.bird || !this.bird.isDead) {
            bgUpdateTick()
        }

        if (this.bird.isInBus && this.bus.x >= constants.GameWidth / 2) {
            this.bus.setAccelerationX(0)
            this.bus.setVelocityX(0)

            this.bird.sprite.setAccelerationX(0)
            this.bird.sprite.setVelocityX(0)
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

        // If the bird hits the floor
        if (this.bird.position.y > 171 + constants.GameAreaTopOffset) {
            if (!this.bird.isDead) this.userDied()

            this.bird.hasHitFloor()
        }

        // If somehow they move to the edge fo the screen past pipes
        if (!this.bird.isDead && this.bird.position.x > constants.GameWidth) {
            this.userDied()
        }

        // The collision of your bird and the pipes
        if (!this.bird.isDead) {
            this.bird.checkCollision(this, this.pipes, this.userDied)
        }

        // Score points by checking whether you got halfway
        this.bird.checkCollision(this, this.scoreLines, this.userScored)

        this.bird.updateRelatedSprites({ tight: false })

        // Let the bus collide
        const busCrash = (bus: Phaser.Physics.Arcade.Sprite) => {
            busCrashed(bus, this)
            if (this.bird && this.bird.isInBus && !this.bird.isDead) {
                this.userDied()
                this.bird.stopBeingInBus()
                this.bird.die(-1 * constants.pipeSpeed)
            }
        }

        this.physics.overlap(this.bus, this.pipes, busCrash, null, this)

        pipeOutOfBoundsCheck(this.pipes)
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

        this.bus.setDepth(constants.zLevels.playerBird - 1)

        if (this.bird.isInBus) {
            // this.bird.flap() will be repsonsible for fixing the bird
            // This is everything else responsible for changing the tutorial mode

            this.tutorialStep = TutorialStep.Flapping

            this.bus.setVelocityX(0)
            this.bus.setAccelerationX(10)
            this.bus.setGravityY(-450)

            // TODO: Drop a "Royale" sign in place
            // TODO: Drop some random birds

            this.pipes.push(
                addRowOfPipesManual(250, this, constants.tutorialGapHeight, constants.tutorialGapSlot, this.theme)
            )
            this.pipes.push(
                addRowOfPipesManual(280, this, constants.tutorialGapHeight, constants.tutorialGapSlot, this.theme)
            )
            this.pipes.push(
                addRowOfPipesManual(310, this, constants.tutorialGapHeight, constants.tutorialGapSlot, this.theme)
            )
            this.pipes.push(
                addRowOfPipesManual(340, this, constants.tutorialGapHeight, constants.tutorialGapSlot, this.theme)
            )
            this.pipes.push(
                addRowOfPipesManual(370, this, constants.tutorialGapHeight, constants.tutorialGapSlot, this.theme)
            )

            if (game.showPlayerBird(this.mode)) {
                this.scoreLines.push(addScoreLine(260, this, this.bird))
            }
        }

        this.bird.flap()
    }

    userScored(_bird: Phaser.GameObjects.Sprite, line: Phaser.Physics.Arcade.Sprite) {
        if (this.tutorialStep === TutorialStep.Flapping) {
            launchMainMenu(this.game)
        }
    }

    userDied() {
        if (this.tutorialStep === TutorialStep.Flapping) {
            this.cameras.main.shake(20, 0.1)
            this.bird.die()

            setTimeout(() => {
                this.restartTheGame()
            }, 500)
        }
    }

    resetGame() {
        this.pipes = []
        this.scoreLines = []
    }

    restartTheGame() {
        this.resetGame()
        this.scene.restart()
    }
}
