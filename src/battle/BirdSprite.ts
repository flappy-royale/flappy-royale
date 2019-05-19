import { createSprite } from "./utils/createSprite"
import * as constants from "../constants"
import { Scene } from "phaser"

export const addBirdToScene = (x: number, y: number, scene: Phaser.Scene) =>
    createSprite(x, y, "bird1", scene, BirdSprite) as BirdSprite

export const preloadBirdSprites = (scene: Phaser.Scene) => {
    scene.load.image("bird1", "assets/Bird1.png")
    scene.load.image("bird2", "assets/Bird2.png")
    scene.load.image("bird3", "assets/Bird3.png")

    // scene.load.spritesheet("bird-flap", "assets/BirdFlapSprite.png", { frameWidth: 17, frameHeight: 12 })
}

export const setupBirdAnimations = (scene: Phaser.Scene) => {
    scene.anims.create({
        key: "flap",
        frames: [
            { key: "bird1", frame: 0 },
            { key: "bird2", frame: 1 },
            { key: "bird3", frame: 2 },
            { key: "bird2", frame: 3 }
        ],
        frameRate: 1,
        repeat: 2
    })

    scene.anims.create({
        key: "dive",
        frames: [{ key: "bird2", frame: 0 }],
        frameRate: 0,
        repeat: -1
    })
}

export class BirdSprite extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body
    isPlayer: boolean = false

    constructor(scene: Scene, x: number, y: number, texture: any, frame: any) {
        super(scene, x, y, texture, frame)
        this.setOrigin(0.13, 0.5)

        // NOOP for now, but this is where customization can occur
        scene.add.existing(this)
    }

    flap() {
        this.body.setVelocityY(-1 * constants.flapStrength)
        if (this.isPlayer) {
            console.log("flap")
        }
        this.play("flap")
    }

    rotateSprite() {
        if (this.body.velocity.y >= 100) {
            if (this.isPlayer) {
                console.log("fall")
            }
            // this.play("dive")
        }
        let newAngle = remapClamped(this.body.velocity.y, 105, 200, -15, 90)

        this.setAngle(newAngle)
    }

    die() {
        if (this.isPlayer) {
            // NOOP
        } else {
            // move with the pipes
            this.body.velocity.x = -1 * constants.pipeSpeed
        }
    }

    preUpdate(_time: number, _delta: number) {
        // Hook up rotation to the general app update cycle
        this.rotateSprite()
    }
}

const remapClamped = (value: number, fromA: number, fromB: number, toA: number, toB: number) => {
    value = Math.min(Math.max(value, fromA), fromB)
    value = toA + (toB - toA) * ((value - fromA) / (fromB - fromA))

    return value
}
