import * as Phaser from "phaser"
import * as c from "../constants"
import { GameTheme, themeMap } from "../battle/theme"
import { preloadPipeSprites } from "../battle/PipeManager"

import { random } from "lodash"
import { centerAlignTextLabel } from "../battle/utils/alignTextLabel"
import { becomeButton } from "./utils/becomeButton"
import { allAttireInGame } from "../attire/attireSets"
import { PresentationAttire, LootboxTier } from "../attire"
import { prepareModalAd, requestModalAd } from "../nativeComms/requestModalAd"
import { consumeEgg } from "../firebase"
export const NewEggFoundSceneKey = "NewEggFoundScene"

// TODO: haptics!

const eggAdID = "Hatch-an-Egg"

interface EggProps {
    eggItemInstanceId: string
    tier?: LootboxTier
}

export class NewEggFoundScene extends Phaser.Scene {
    props: EggProps

    particles!: Phaser.GameObjects.Particles.ParticleEmitterManager
    egg!: Phaser.GameObjects.Image
    eggWings!: Phaser.GameObjects.Sprite

    seenAd: boolean = false
    bottomLabel!: Phaser.GameObjects.BitmapText
    buttonLabel!: Phaser.GameObjects.BitmapText

    unlockedItem: PresentationAttire | undefined

    constructor(props: EggProps) {
        super(NewEggFoundSceneKey)
        this.props = props
    }

    preload() {
        this.load.image("confetti-green", require("../../assets/battle/confetti-green.png"))
        this.load.image("confetti-blue", require("../../assets/battle/confetti-blue.png"))
        this.load.image("confetti-yellow", require("../../assets/battle/confetti-yellow.png"))
        this.load.image("flap1", require("../../assets/battle/Flap1.png"))
        this.load.image("flap2", require("../../assets/battle/Flap2.png"))
        this.load.image("flap3", require("../../assets/battle/Flap3.png"))
        this.load.image("egg", require("../../assets/menu/EggGold.png"))
        this.load.image("egg-top", require("../../assets/menu/EggGoldTop.png"))
        this.load.image("egg-bottom", require("../../assets/menu/EggGoldBottom.png"))
        this.load.image("button-bg", require("../../assets/menu/ButtonBG.png"))

        this.load.bitmapFont(
            "fipps-bit",
            require("../../assets/fonts/fipps.png"),
            require("../../assets/fonts/fipps.fnt")
        )
        preloadPipeSprites(this, GameTheme.default)
    }

    create() {
        this.fadeInBlackBG()
        this.setupPipes()

        this.anims.create({
            key: "flap",
            frames: [
                { key: "flap1", frame: 0 },
                { key: "flap2", frame: 1 },
                { key: "flap3", frame: 2 },
                { key: "flap2", frame: 3 }
            ],
            frameRate: 6,
            repeat: -1
        })

        this.time.delayedCall(1600, this.showBottomMessage, [], this)
        this.time.delayedCall(1610, this.flapEggIn, [], this)

        prepareModalAd(eggAdID)
    }

    flapEggIn() {
        this.particles = this.add.particles("", {
            x: c.GameWidth / 2,
            y: c.GameAreaHeight / 2,
            scale: { start: 0.02, end: 0.05 },
            blendMode: "ADD",
            maxParticles: 0,
            lifespan: 11000,
            speed: 10,
            tint: 0x221199
        })

        const egg = this.add.image(c.GameWidth / 2 - 200, c.GameHeight / 2, "egg")
        egg.setAngle(20)
        this.egg = egg

        const wings = this.add.sprite(egg.x, egg.y, "flap1")
        wings.play("flap")
        wings.setScale(2, 2)
        this.eggWings = wings

        this.add.tween({
            targets: [egg, wings],
            delay: 300,
            x: "+=200",
            ease: "Sine.easeInOut"
        })

        this.add.tween({
            targets: [egg, wings],
            delay: 300,
            duration: 1200,
            y: "-=30",
            ease: "Sine.easeInOut",
            yoyo: true
        })
    }

    private setupPipes() {
        // These go down!

        const movement = 60

        const pipeBottomLeft = this.createPipe(35 - movement, 200) // bottom
        pipeBottomLeft.angle = 26
        this.add.tween({
            targets: pipeBottomLeft,
            delay: 300,
            x: "+=60",
            ease: "Sine.easeInOut",
            onComplete: this.explodePipe,
            onCompleteScope: this
        })

        const pipeMidLeft = this.createPipe(30 - movement, 140) // mid
        pipeMidLeft.angle = 26
        this.add.tween({
            targets: pipeMidLeft,
            delay: 400,
            x: "+=60",
            ease: "Sine.easeInOut",
            onComplete: this.explodePipe,
            onCompleteScope: this
        })

        const pipeTopLeft = this.createPipe(25 - movement, 80) // top
        pipeTopLeft.angle = 26
        this.add.tween({
            targets: pipeTopLeft,
            delay: 500,
            x: "+=60",
            ease: "Sine.easeInOut",
            onComplete: this.explodePipe,
            onCompleteScope: this
        })

        const pipeBottomRight = this.createPipe(c.GameWidth - 35 + movement, 200) // bottom
        pipeBottomRight.angle = -26
        this.add.tween({
            targets: pipeBottomRight,
            delay: 300,
            x: "-=60",
            ease: "Sine.easeInOut",
            onComplete: this.explodePipe,
            onCompleteScope: this
        })

        const pipeMidRight = this.createPipe(c.GameWidth - 30 + movement, 140) // mid
        pipeMidRight.angle = -26
        this.add.tween({
            targets: pipeMidRight,
            delay: 400,
            x: "-=60",
            ease: "Sine.easeInOut",
            onComplete: this.explodePipe,
            onCompleteScope: this
        })

        const pipeTopRight = this.createPipe(c.GameWidth - 25 + movement, 80) // top
        pipeTopRight.angle = -26
        this.add.tween({
            targets: pipeTopRight,
            delay: 500,
            x: "-=60",
            ease: "Sine.easeInOut",
            onComplete: this.explodePipe,
            onCompleteScope: this
        })
    }

    private explodePipe(_: any, targets: any[]): void {
        const pipeContainer = targets[0] as Phaser.GameObjects.Container
        const existingPipeImage = pipeContainer.getAt(1) as Phaser.GameObjects.Image
        this.tweens.add({
            targets: existingPipeImage,
            y: 4,
            ease: "Sine.easeInOut",
            duration: 60,
            yoyo: true
        })

        const confettiCount = random(10, 30)
        for (var i = 0; i < confettiCount; i++) {
            const goLeft = pipeContainer.x < c.GameWidth / 2
            const name = random(0, 1) ? "confetti-green" : "confetti-blue"
            const trash1 = this.physics.add.image(pipeContainer.x + 2, pipeContainer.y - 4, name)

            trash1.setVelocity(random(goLeft ? 20 : -20, goLeft ? 100 : -120), random(-140, -200))
            const tBody = trash1.body as Phaser.Physics.Arcade.Body
            tBody.setAngularVelocity(random(400, 800))
        }
    }

    private createPipe(x: number, y: number) {
        const sprites = themeMap[GameTheme.default]

        const container = this.add.container(x, y)
        const pipeBottom = this.add.image(0, 120, sprites.body[0])
        pipeBottom.setScale(1.5, 120)
        container.add(pipeBottom)
        const pipeTop = this.add.image(0, 0, sprites.bottom[0])
        pipeTop.setScale(1.5, 1.5)
        container.add(pipeTop)
        return container
    }

    private fadeInBlackBG() {
        const rect = this.add.rectangle(c.GameWidth / 2, c.GameHeight / 2, c.GameWidth, c.GameHeight, 0x000000, 0.6)
        this.add.tween({
            targets: [rect],
            ease: "Sine.easeInOut",
            duration: 600,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1
            }
        })
    }

    private showBottomMessage() {
        const highest = this.add.rectangle(c.GameWidth / 2, c.GameHeight + 70, c.GameWidth, 140, 0x000000, 0.3)
        this.add.tween({
            targets: highest,
            delay: 300,
            y: "-=120",
            ease: "Sine.easeInOut"
        })

        const medium = this.add.rectangle(c.GameWidth / 2, c.GameHeight + 70, c.GameWidth, 140, 0x000000, 0.4)
        this.add.tween({
            targets: medium,
            delay: 500,
            y: "-=100",
            ease: "Sine.easeInOut"
        })

        const bottom = this.add.rectangle(c.GameWidth / 2, c.GameHeight + 90, c.GameWidth, 140, 0x000000, 0.4)
        this.add.tween({
            targets: bottom,
            delay: 700,
            y: "-=100",
            ease: "Sine.easeInOut",
            onComplete: this.showText,
            onCompleteScope: this
        })
    }

    showText() {
        const text = this.add.bitmapText(0, c.GameHeight - 68, "fipps-bit", `You found an egg!`, 8)
        centerAlignTextLabel(text)

        const buttonBG = this.add.image(c.GameWidth / 2, c.GameHeight - 30, "button-bg")
        const buttonText = this.add.bitmapText(c.GameWidth / 2, c.GameHeight - 37, "fipps-bit", "OPEN VIA AD", 8)
        centerAlignTextLabel(buttonText)
        becomeButton(buttonBG, this.tappedButton, this, [buttonText])

        this.bottomLabel = text
        this.buttonLabel = buttonText
    }

    tappedButton = async () => {
        this.particles.destroy()

        if (this.seenAd) {
            // remove the scene
            this.game.scene.remove(this)
        } else {
            this.vibrateEgg()

            if (c.isInDevMode) {
                this.time.delayedCall(510, this.adsHaveBeenUnlocked, [], this)
            } else {
                this.time.delayedCall(510, requestModalAd, [eggAdID], this)
            }
        }
    }

    vibrateEgg() {
        this.add.tween({
            targets: [this.egg, this.eggWings],
            scaleX: 1,
            scaleY: 1,
            x: "+= 1",
            y: "+=1",
            angle: "5",
            _ease: "Sine.easeInOut",
            ease: "Power2",
            duration: 150,
            repeat: -1,
            yoyo: true
        })
    }

    adsHaveBeenUnlocked() {
        // OK, we can now unlock
        this.seenAd = true
        this.unlockEgg()
    }

    async unlockEgg() {
        const response = await consumeEgg(this.props.eggItemInstanceId)
        if ("error" in response) {
            return alert("Sorry, there was a problem unlocking your egg")
        }

        if (!response.item) {
            return alert("You have unlocked everything, congrats!")
        }

        const attire = allAttireInGame.find(a => a.id === response.item)
        if (!attire) {
            console.log("Could not find item ", response.item)
            return
        }

        this.unlockedItem = attire
        this.load.image("unlocked", attire.href)
        this.load.on("filecomplete", this.openEgg, this)
        this.load.start()
    }

    openEgg() {
        this.bottomLabel.setText(`${this.unlockedItem!.name}`)
        this.buttonLabel.setText("Cool")

        this.eggWings.destroy()

        const unlockedItem = this.add.image(this.egg.x, this.egg.y, "unlocked")
        this.add.tween({
            targets: [unlockedItem],
            y: "-= 20",
            delay: 400,
            duration: 300
        })

        const eggTop = this.add.image(this.egg.x, this.egg.y, "egg-top")
        eggTop.setAngle(20)
        const eggBottom = this.add.image(this.egg.x, this.egg.y, "egg-bottom")
        eggBottom.setAngle(20)

        this.egg.destroy()

        this.add.tween({
            targets: [eggBottom],
            angle: 0,
            delay: 100,
            duration: 300
        })

        this.add.tween({
            targets: [eggTop, this.eggWings],
            angle: -270
        })

        this.add.tween({
            targets: [eggTop, this.eggWings],
            x: "-=20",
            y: "-=30",
            ease: "Cubic.easeIn",
            duration: 300,
            onComplete: (_: any, targets) => {
                this.add.tween({
                    targets,
                    x: "-=40",
                    y: "+=180",
                    ease: "Cubic.easeOut",
                    duration: 1400
                })
            }
        })
    }
}
