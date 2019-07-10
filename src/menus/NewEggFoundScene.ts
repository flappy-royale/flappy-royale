import * as Phaser from "phaser"
import * as c from "../constants"
import { GameTheme, themeMap } from "../battle/theme"
import { preloadPipeSprites } from "../battle/PipeManager"

import { random, shuffle } from "lodash"
import { centerAlignTextLabel } from "../battle/utils/alignTextLabel"
export const NewEggFoundSceneKey = "NewEggFoundScene"

export class NewEggFoundScene extends Phaser.Scene {
    preload() {
        this.load.image("confetti-green", require("../../assets/battle/confetti-green.png"))
        this.load.image("confetti-blue", require("../../assets/battle/confetti-blue.png"))
        this.load.image("flap1", require("../../assets/battle/Flap1.png"))
        this.load.image("flap2", require("../../assets/battle/Flap2.png"))
        this.load.image("flap3", require("../../assets/battle/Flap3.png"))

        this.load.image("egg", require("../../assets/menu/EggGold.png"))

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

        this.bringToTop()
    }

    flapEggIn() {
        const egg = this.add.image(c.GameWidth / 2, c.GameHeight / 2, "egg")
        egg.setAngle(24)

        const wings = this.add.sprite(egg.x, egg.y, "flap1")
        wings.play("flap")
        wings.setScale(2, 2)

        // eBody.setGravityX(120)
        // eBody.setVelocityY(c.flapStrength * -2)
        // egg.setAngle(40)

        // this.add.tween({
        //     targets: egg,
        //     delay: 200,
        //     angle: 0,
        //     ease: "Sine.easeInOut"
        // })

        // this.time.delayedCall(
        //     1150,
        //     () => {
        //         eBody.setVelocity(0, 0)
        //         eBody.setGravityX(0)
        //         eBody.setGravityY(-c.gravity)
        //         egg.setAngle(0)

        //         // Yeah, these particles are green. Deal with it,
        //         // it's a bug but I think I like it this way
        //         this.add.particles("particle").createEmitter({
        //             x: egg.x,
        //             y: egg.y,
        //             scale: { start: 0.02, end: 0.02 },
        //             blendMode: "SCREEN",
        //             maxParticles: 0,
        //             lifespan: 15000,
        //             speed: 10
        //         })
        //     },
        //     [],
        //     this
        // )
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
        const highest = this.add.rectangle(c.GameWidth / 2, c.GameHeight + 50, c.GameWidth, 140, 0x000000, 0.3)
        this.add.tween({
            targets: highest,
            delay: 300,
            y: "-=100",
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
        centerAlignTextLabel(this.add.bitmapText(0, c.GameHeight / 2 + 34, "fipps-bit", `You've found an egg`, 8))
    }

    bringToTop() {
        this.game.scene.bringToTop(NewEggFoundSceneKey)
    }
}
