import * as constants from "../constants"
import { Scene } from "phaser"

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
        frameRate: 12,
        repeat: 0
    })

    scene.anims.create({
        key: "dive",
        frames: [{ key: "bird2", frame: 0 }],
        frameRate: 0,
        repeat: -1
    })
}

export class BirdSprite {
    position: Phaser.Math.Vector2

    isPlayer: boolean = false
    isInBus: boolean

    private sprite: Phaser.GameObjects.Sprite
    private body: Phaser.Physics.Arcade.Body

    constructor(scene: Scene, x: number, y: number, isPlayer: boolean = true) {
        this.sprite = scene.physics.add.sprite(x, y, "bird1")
        this.sprite.setOrigin(0.13, 0.5)

        this.isPlayer = isPlayer

        this.body = this.sprite.body as Phaser.Physics.Arcade.Body
        this.body.setAllowGravity(false)
        this.isInBus = true

        this.position = this.body.position

        if (!isPlayer) {
            this.sprite.setAlpha(0.3)
        } else {
            this.sprite.setDepth(constants.zLevels.playerBird)
        }
    }

    checkCollision(
        scene: Scene,
        objects: Phaser.Types.Physics.Arcade.ArcadeColliderType,
        callback: ArcadePhysicsCallback
    ) {
        return scene.physics.overlap(this.sprite, objects, callback, null, scene)
    }

    flap() {
        if (this.isPlayer) {
            console.log("flap")
        }

        if (this.isInBus) {
            this.body.setAllowGravity(true)
            this.isInBus = false
        } else {
            this.body.setVelocityY(-1 * constants.flapStrength)
            this.sprite.play("flap")
        }
    }

    rotateSprite() {
        if (this.body.velocity.y >= 100) {
            if (this.isPlayer) {
                console.log("fall")
            }
            this.sprite.play("dive")
        }
        let newAngle = remapClamped(this.body.velocity.y, 105, 200, -15, 90)

        this.sprite.setAngle(newAngle)
    }

    die() {
        if (this.isPlayer) {
            // NOOP
        } else {
            // move with the pipes
            this.body.velocity.x = -1 * constants.pipeSpeed
        }
    }

    preUpdate() {
        this.rotateSprite()
    }
}

const remapClamped = (value: number, fromA: number, fromB: number, toA: number, toB: number) => {
    value = Math.min(Math.max(value, fromA), fromB)
    value = toA + (toB - toA) * ((value - fromA) / (fromB - fromA))

    return value
}
