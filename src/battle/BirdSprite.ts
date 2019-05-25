import * as constants from "../constants"
import { Scene } from "phaser"

import { UserSettings, getUserSettings } from "../user/userManager"
import { BattleScene } from "./Scene"

export const preloadBirdSprites = (scene: BattleScene) => {
    scene.load.image("flap1", require("../../assets/battle/Flap1.png"))
    scene.load.image("flap2", require("../../assets/battle/Flap2.png"))
    scene.load.image("flap3", require("../../assets/battle/Flap3.png"))

    // Preload user attire
    const userSettings = getUserSettings()
    userSettings.aesthetics.attire.forEach(attire => {
        scene.load.image(attire.id, attire.href)
    })

    // Preload opponents attire
    scene.seedData.users.forEach(data => preloadBirdAttire(scene, data.user))
}

export const preloadBirdAttire = (scene: Phaser.Scene, bird: UserSettings) => {
    for (const attire of bird.aesthetics.attire) {
        scene.load.image(attire.id, attire.href)
    }
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
    isAtRest: boolean = false

    // The bird itself
    private bodySprite: Phaser.GameObjects.Sprite
    // Actually the wings
    private sprite: Phaser.Physics.Arcade.Sprite
    // HATS
    private attire: Phaser.GameObjects.Image[]
    // the physics representation of the bird
    private body: Phaser.Physics.Arcade.Body

    // Don't apply gravity / velocity etc during the constructor
    // because this is used for previews
    //
    constructor(scene: Scene, x: number, y: number, meta: { isPlayer: boolean; settings: UserSettings }) {
        this.isPlayer = meta.isPlayer

        // Setup the base body
        const base = meta.settings.aesthetics.attire.find(a => a.base)
        if (!base) throw "No base attire found"
        this.bodySprite = scene.add.sprite(x, y, base.id)
        this.bodySprite.setOrigin(0.13, 0.5)

        // Setup clothes
        this.attire = meta.settings.aesthetics.attire
            .filter(a => !a.base)
            .map(a => {
                const image = scene.add.image(x, y, a.id)
                image.setOrigin(0.13, 0.5)
                return image
            })

        this.sprite = scene.physics.add.sprite(x, y, "flap1")
        this.sprite.setOrigin(0.13, 0.6)

        // Set up
        this.body = this.sprite.body as Phaser.Physics.Arcade.Body
        this.isInBus = true

        this.position = this.body.position

        if (!meta.isPlayer) {
            this.bodySprite.setAlpha(0.3)
            this.sprite.setAlpha(0.3)
            this.attire.forEach(a => a.setAlpha(0.3))
        } else {
            this.bodySprite.setDepth(constants.zLevels.playerBird)
            this.sprite.setDepth(constants.zLevels.playerBird + 10)
            this.attire.forEach(a => (a.depth = constants.zLevels.birdAttire + 1))
        }

        scene.sys.events.addListener("postupdate", () => {
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
        this.sprite.play("flap")
    }

    rotateSprite() {
        if (this.body.velocity.y >= 100) {
            this.sprite.play("dive")
        }

        let newAngle = remapClamped(this.body.velocity.y, 105, 200, -15, 90)
        this.sprite.setAngle(newAngle)
    }

    destroy() {
        const sprites = [this.bodySprite, this.sprite, ...this.attire]
        sprites.forEach(s => s.destroy())
    }

    die() {
        // move with the pipes
        if (!this.isPlayer) {
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

    actAsImage() {
        this.sprite.setGravityY(constants.gravity * -1)
        const sprites = [this.bodySprite, this.sprite, ...this.attire]
        sprites.forEach(a => a.setAlpha(1))
        this.sprite.play("flap")
    }

    hasHitFloor() {
        this.isAtRest = true
        this.sprite.setGravityY(constants.gravity * -1)
        this.sprite.setVelocityY(0)
    }

    preUpdate() {
        if (this.sprite.anims) {
            if (!this.isAtRest) {
                this.rotateSprite()
            }
            // We can't attach physics bodies together
            // so attire is just manually kept up to date with the positioning
            // of the sprite, this means attire needs to be centered on the bird

            this.bodySprite.setPosition(this.sprite.x, this.sprite.y)
            this.bodySprite.rotation = this.sprite.rotation

            this.attire.forEach(attire => {
                attire.setPosition(this.bodySprite.x, this.bodySprite.y)
                attire.rotation = this.bodySprite.rotation
            })
        }
    }
}

const remapClamped = (value: number, fromA: number, fromB: number, toA: number, toB: number) => {
    value = Math.min(Math.max(value, fromA), fromB)
    value = toA + (toB - toA) * ((value - fromA) / (fromB - fromA))

    return value
}
