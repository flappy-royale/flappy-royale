import * as constants from "../constants"
import { Scene } from "phaser"

export const preloadBirdSprites = (scene: Phaser.Scene) => {
    scene.load.image("flap1", "assets/Flap1.png")
    scene.load.image("flap2", "assets/Flap2.png")
    scene.load.image("flap3", "assets/Flap3.png")

    scene.load.image("body", "assets/BirdBody.png")

    scene.load.image("hat1", "assets/Hat1.png")
    scene.load.image("hat2", "assets/Hat2.png")
    scene.load.image("hat3", "assets/Hat3.png")
}

export const setupBirdAnimations = (scene: Phaser.Scene) => {
    scene.anims.create({
        key: "flap",
        frames: [
            { key: "flap1", frame: 0 },
            { key: "flap2", frame: 1 },
            { key: "flap3", frame: 2 },
            { key: "flap2", frame: 3 }
        ],
        frameRate: 12,
        repeat: -1
    })

    scene.anims.create({
        key: "dive",
        frames: [{ key: "flap2", frame: 0 }],
        frameRate: 0,
        repeat: 0
    })
}

export class BirdSprite {
    position: Phaser.Math.Vector2

    isPlayer: boolean = false
    isInBus: boolean
    isDead: boolean = false

    // The bird itself
    private sprite: Phaser.Physics.Arcade.Sprite
    private wings: Phaser.GameObjects.Sprite
    // HATS
    private attire: Phaser.GameObjects.Image[]
    // the physics representation of the bird
    private body: Phaser.Physics.Arcade.Body

    constructor(scene: Scene, x: number, y: number, isPlayer: boolean = true) {
        this.sprite = scene.physics.add.sprite(x, y, "body")
        this.sprite.setOrigin(0.13, 0.5)

        this.wings = scene.add.sprite(x, y, "flap1")
        this.wings.setOrigin(0.13, 0.5)

        this.isPlayer = isPlayer

        // Temporarily randomly assign hats to any bird
        let hat: Phaser.GameObjects.Image | undefined
        const randomAttire = Math.floor(Math.random() * 12)
        switch (randomAttire) {
            case 0:
                hat = scene.add.image(x, y, "hat1")
                break
            case 1:
                hat = scene.add.image(x, y, "hat2")
                break
            case 2:
                hat = scene.add.image(x, y, "hat3")
                break
            default:
                break
        }

        if (hat) {
            hat.setOrigin(0.13, 0.5)
            this.attire = [hat]
        } else {
            this.attire = []
        }

        this.body = this.sprite.body as Phaser.Physics.Arcade.Body
        this.isInBus = true
        this.setupForBeingInBus()

        this.position = this.body.position

        if (!isPlayer) {
            this.sprite.setAlpha(0.3)
            this.wings.setAlpha(0.3)
            this.attire.forEach(a => a.setAlpha(0.3))
        } else {
            this.sprite.setDepth(constants.zLevels.playerBird)
            this.wings.setDepth(constants.zLevels.playerBird + 1)
            this.attire.forEach(a => (a.depth = constants.zLevels.birdAttire + 2))
        }

        scene.sys.events.addListener("update", () => {
            this.preUpdate()
        })
    }

    checkCollision(
        scene: Scene,
        objects: Phaser.Types.Physics.Arcade.ArcadeColliderType,
        callback: ArcadePhysicsCallback
    ) {
        return scene.physics.overlap(this.sprite, objects, callback, null, scene)
    }

    flap() {
        if (this.isInBus) {
            this.isInBus = false
            this.stopBeingInBus()
        }

        this.body.setVelocityY(-1 * constants.flapStrength)
        this.wings.play("flap")
    }

    rotateSprite() {
        if (this.body.velocity.y >= 100) {
            this.wings.play("dive")
        }

        let newAngle = remapClamped(this.body.velocity.y, 105, 200, -15, 90)
        this.sprite.setAngle(newAngle)
    }

    destroy() {
        this.sprite.destroy()
    }

    die() {
        if (this.isPlayer) {
            // NOOP
        } else {
            // move with the pipes
            this.body.velocity.x = -1 * constants.pipeSpeed
        }
        this.isDead = true
    }

    // Use the same gravity + velocity as the bus
    // until the bird first jumps and stop having x velocity
    // and a custom (slower) gravity

    setupForBeingInBus() {
        this.sprite.setGravityY(-450)
        this.sprite.setAccelerationX(20)
    }

    stopBeingInBus() {
        this.sprite.setGravityY(0)
        this.sprite.setAccelerationX(0)
        this.sprite.setVelocityX(0)
    }

    preUpdate() {
        if (this.sprite.anims) {
            this.rotateSprite()
            // We can't attach physics bodies together
            // so attire is just manually kept up to date with the positioning
            // of the sprite, this means attire needs to be centered on the bird
            this.attire.forEach(attire => {
                attire.setPosition(this.sprite.x, this.sprite.y)
                attire.rotation = this.sprite.rotation
            })

            this.wings.setPosition(this.sprite.x, this.sprite.y)
            this.wings.rotation = this.sprite.rotation
        }
    }
}

const remapClamped = (value: number, fromA: number, fromB: number, toA: number, toB: number) => {
    value = Math.min(Math.max(value, fromA), fromB)
    value = toA + (toB - toA) * ((value - fromA) / (fromB - fromA))

    return value
}
