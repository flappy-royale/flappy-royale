import { createSprite } from "./utils/createSprite"
import * as constants from "../constants"
import { Scene } from "phaser"

export const addBirdToScene = (x: number, y: number, scene: Phaser.Scene) =>
    createSprite(x, y, "bird1", scene, BirdSprite) as BirdSprite

export const preloadBirdSprites = (scene: Phaser.Scene) => {
    scene.load.image("bird1", "assets/Bird1.png")
    scene.load.image("bird2", "assets/Bird2.png")
    scene.load.image("bird3", "assets/Bird3.png")
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
        frameRate: 18,
        repeat: -1
    })

    scene.anims.create({
        key: "dive",
        frames: [{ key: "bird2", frame: 0 }],
        frameRate: 0,
        repeat: -1
    })
}

export class BirdSprite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, x: number, y: number, texture: any, frame: any) {
        super(scene, x, y, texture, frame)
        // NOOP for now, but this is where customization can occur
        scene.add.existing(this)
    }

    flap() {
        const body = this.body as Phaser.Physics.Arcade.Body
        body.setVelocityY(-1 * constants.flapStrength)
        this.play("flap")
    }

    rotateSprite() {
        const body = this.body as Phaser.Physics.Arcade.Body
        if (body.velocity.y >= 100) this.play("dive")
        let newAngle = remapClamped(body.velocity.y, 105, 200, -15, 90)

        this.setAngle(newAngle)
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
