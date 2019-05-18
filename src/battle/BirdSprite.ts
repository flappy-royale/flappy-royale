import { createSprite } from "./utils/createSprite"
import * as constants from "../constants"
import { Scene } from "phaser"

export const addBirdToScene = (x: number, y: number, key: string, scene: Phaser.Scene) =>
    createSprite(x, y, key, scene, BirdSprite) as BirdSprite

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
        // Ensure rotation
        this.rotateSprite()
    }
}

const remapClamped = (value: number, fromA: number, fromB: number, toA: number, toB: number) => {
    value = Math.min(Math.max(value, fromA), fromB)
    value = toA + (toB - toA) * ((value - fromA) / (fromB - fromA))

    return value
}
