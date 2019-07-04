import * as Phaser from "phaser"
import * as constants from "../constants"
import * as game from "./utils/gameMode"

import { preloadBackgroundSprites, bgUpdateTick, createBackgroundSprites } from "./Background"
import { preloadPipeSprites, pipeOutOfBoundsCheck, nudgePipesOntoPixelGrid, addRowOfPipesManual } from "./PipeManager"
import { BirdSprite, preloadBirdSprites, setupBirdAnimations, preloadBirdAttire } from "./BirdSprite"
import { addScoreLine } from "./scoreLine"
import { busCrashed, preloadBusImages } from "./utils/createBus"
import { getUserSettings } from "../user/userManager"
import { launchMainMenu, MainMenuScene } from "../menus/MainMenuScene"
import { deathPreload } from "./overlays/RoyaleDeathScene"
import { GameTheme, themeMap } from "./theme"
import { addScene } from "../menus/utils/addScene"
import { showPrompt, Prompt } from "../menus/Prompt"
import _ = require("lodash")
import { becomeButton } from "../menus/utils/becomeButton"
import { debugAttire } from "../attire"

/** Used on launch, and when you go back to the main menu */
export const launchTutorial = (game: Phaser.Game) => {
    const scene = new TutorialScene()
    addScene(game, "TutorialScene", scene, true)
}

enum TutorialStep {
    InBus = 1,
    Flapping,
    CanSeePipes,
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

    /* Scene timestamp for when the most recent round started
     * So recording timestamps can be consistent */
    private timestampOffset: number = 0

    /** The RNG function for this current run, pipes, and all ghosts */
    public rng: () => number

    /** Track spacebar keypresses to flap */
    private spacebar: Phaser.Input.Keyboard.Key

    /** What game mode is this scene running in? */
    public mode: game.GameMode = game.GameMode.Tutorial

    /** How far along in the tutorial is the user */
    private tutorialStep: TutorialStep = TutorialStep.InBus

    public theme: GameTheme = GameTheme.default

    /** The thing that represents the floor (birds/the bus sit on this) */
    public floorPhysics: Phaser.Physics.Arcade.Image

    /** THe current active prompt */
    private prompt?: Prompt

    /** How many times the user has flapped */
    private numberOfFlaps: number = 0

    private pipeScore: number = 0

    private disableJumping = false

    /** What you see to go back, hides on dying in a royale */
    private backButton: Phaser.GameObjects.Image

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
            window.removeEventListener("mousedown", flap)
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
        preloadBirdAttire(this, debugAttire)

        this.load.image("back-button", require("../../assets/menu/Back2.png"))
        this.load.image("flag", require("../../assets/battle/flag.png"))

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

        const back = this.add.image(16, constants.GameHeight - 16, "back-button").setInteractive()
        becomeButton(back, this.goBackToMainMenu, this)

        back.setDepth(constants.zLevels.ui)
        this.backButton = back

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
        // const birdConfig = { isPlayer: true, settings: {} }
        this.bird = new BirdSprite(
            this,
            constants.birdXPosition,
            constants.birdYPosition + constants.GameAreaTopOffset,
            { isPlayer: true, settings: { name: "", aesthetics: { attire: debugAttire } } }
        )

        // this.bird.sprite.setGravityY(-constants.gravity)
        // this.bird.sprite.setAccelerationX(20)

        this.bird.addCollideForSprite(this, this.floorPhysics)

        this.prompt = showPrompt(
            {
                subtitle: "Tap to leave the bus",
                y: (4 / 5) * constants.GameHeight
            },
            this.game
        )

        // On spacebar bounce the bird
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    }

    goBackToMainMenu() {
        // delay to kill the "now flap" scene
        setTimeout(() => {
            const scenes = this.game.scene.scenes
            scenes.forEach(element => this.game.scene.remove(element))
            launchMainMenu(this.game)
        }, 300)
    }

    setupPhysicsFloor() {
        /** the physics floor, so that the bus + bird can land on it */
        this.floorPhysics = this.physics.add.staticImage(
            80,
            constants.GameAreaHeight - 42 + constants.GameAreaTopOffset,
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

        // Just applying velocity, pipes have non-integer X values, which causes them to jiggle
        // Naively rounding their x-values down to the nearest int seems to work,
        // although could cause unexpected issues?
        nudgePipesOntoPixelGrid(this.pipes)

        if (this.bird) {
            if (this.bird.isInBus && this.bus.x >= constants.GameWidth / 2) {
                this.bus.setAccelerationX(0)
                this.bus.setVelocityX(0)

                this.bird.stopMovingX()
            }

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
        }

        // Let the bus collide
        const busCrash = (bus: Phaser.Physics.Arcade.Sprite) => {
            busCrashed(bus, this)
            if (this.bird && this.bird.isInBus && !this.bird.isDead) {
                this.userDied()
                this.bird.stopBeingInBus()
                this.bird.die(-1 * constants.pipeSpeed)
            }
        }

        this.physics.overlap(this.bus, this.pipes, busCrash, undefined, this)

        pipeOutOfBoundsCheck(this.pipes)
    }

    userFlap(force?: boolean) {
        // When you complete, the game takes over the last few flaps off-screen
        if (this.disableJumping && !force) return

        // No dead birds flapping y'hear
        if (this.bird && this.bird.isDead) return

        // Give a delay of 1s so that your sprite is on-screen entirely
        const timestamp = Math.round(this.time.now - this.timestampOffset)
        if (timestamp < 1000) return

        this.bus.setDepth(constants.zLevels.oneBelowBird)

        if (this.bird && this.bird.isInBus) {
            // this.bird.flap() will be repsonsible for fixing the bird
            // This is everything else responsible for changing the tutorial mode

            this.tutorialStep = TutorialStep.Flapping

            this.scene.remove(this.prompt)
            setTimeout(() => {
                this.prompt = showPrompt(
                    {
                        subtitle: "Tap to flap",
                        y: (4 / 5) * constants.GameHeight
                    },
                    this.game
                )
            }, 200)

            this.bus.setVelocityX(0)
            this.bus.setAccelerationX(10)
            this.bus.setGravityY(-450)

            // TODO: Drop a "Royale" sign in place
            // TODO: Drop some random birds

            this.pipes.push(
                addRowOfPipesManual(300, this, constants.tutorialGapHeight, constants.tutorialGapSlot, this.theme)
            )
            this.pipes.push(
                addRowOfPipesManual(380, this, constants.tutorialGapHeight, constants.tutorialGapSlot - 1, this.theme)
            )
            this.pipes.push(
                addRowOfPipesManual(460, this, constants.tutorialGapHeight, constants.tutorialGapSlot, this.theme)
            )

            this.physics.add
                .sprite(520, constants.GameHeight - 80, "flag")
                .setVelocityX(-1 * constants.pipeSpeed)
                .setGravityY(-1 * constants.gravity)

            if (game.showPlayerBird(this.mode)) {
                this.scoreLines.push(addScoreLine(310, this, this.bird))
                this.scoreLines.push(addScoreLine(390, this, this.bird))
                this.scoreLines.push(addScoreLine(470, this, this.bird))
            }
        } else {
            this.numberOfFlaps += 1
            if (this.tutorialStep === TutorialStep.Flapping && this.prompt && this.numberOfFlaps >= 3) {
                this.tutorialStep = TutorialStep.CanSeePipes

                this.scene.remove(this.prompt)
                this.prompt = undefined

                setTimeout(() => {
                    this.prompt = showPrompt(
                        {
                            subtitle: "Fly through the pipes",
                            y: (4 / 5) * constants.GameHeight
                        },
                        this.game
                    )
                }, 600)
            }
        }

        this.bird && this.bird.flap()
    }

    userScored(_bird: Phaser.GameObjects.Sprite, line: Phaser.Physics.Arcade.Sprite) {
        this.pipeScore += 1
        line.destroy()

        if (this.pipeScore >= 3) {
            this.scene.remove(this.prompt)
            this.tutorialStep = TutorialStep.Done
            setTimeout(() => {
                this.disableJumping = true
                this.bird && this.bird.startMovingLeft()

                let flapCount = 1
                this.time.addEvent({
                    delay: 750,
                    callback: () => {
                        if (flapCount < 5) this.userFlap(true)
                        flapCount++
                    },
                    loop: true
                })

                this.prompt = showPrompt(
                    {
                        title: "Nailed it!",
                        yes: "WOO!",
                        y: constants.GameHeight / 3,
                        completion: (response: boolean, prompt: Prompt) => {
                            this.scene.remove(prompt)
                            _.defer(() => {
                                this.scene.remove(this)
                                launchMainMenu(this.game)
                            })
                        }
                    },
                    this.game
                )
            }, 300)
        }
    }

    userDied() {
        if (this.tutorialStep !== TutorialStep.Done) {
            this.cameras.main.shake(20, 0.1)
            this.bird && this.bird.die()

            setTimeout(() => {
                this.restartTheGame()
            }, 400)
        }
    }

    resetGame() {
        this.pipes = []
        this.scoreLines = []

        if (this.prompt) {
            this.scene.remove(this.prompt)
        }
    }

    restartTheGame() {
        this.resetGame()
        this.scene.restart()
    }
}
