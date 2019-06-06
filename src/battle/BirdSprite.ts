import * as constants from "../constants"
import { Scene } from "phaser"

import { UserSettings, getUserSettings } from "../user/userManager"
import { BattleScene } from "./Scene"

export const preloadBirdSprites = (scene: BattleScene | Scene) => {
    scene.load.image("flap1", require("../../assets/battle/Flap1.png"))
    scene.load.image("flap2", require("../../assets/battle/Flap2.png"))
    scene.load.image("flap3", require("../../assets/battle/Flap3.png"))

    scene.load.image("focusBackdrop", require("../../assets/bases/focusSprite.png"))

    // Preload user attire
    const userSettings = getUserSettings()
    userSettings.aesthetics.attire.forEach(attire => {
        scene.load.image(attire.id, attire.href)
    })

    if ("seedData" in scene) {
        // Preload opponents attire
        scene.seedData.replays.forEach(data => preloadBirdAttire(scene, data.user))
    }
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
    // Focus sprite
    private focusSprite: Phaser.GameObjects.Image
    // HATS
    private tightAttire: Phaser.GameObjects.Image[]
    private looseAttire: Phaser.GameObjects.Image[]
    // the physics representation of the bird
    private body: Phaser.Physics.Arcade.Body

    private scene: Scene
    // Don't apply gravity / velocity etc during the constructor
    // because this is used for previews
    //
    constructor(scene: Scene, x: number, y: number, meta: { isPlayer: boolean; settings: UserSettings }) {
        this.isPlayer = meta.isPlayer

        this.scene = scene

        // Setup the base body
        const base = meta.settings.aesthetics.attire.find(a => a.base)
        if (!base) throw "No base attire found"
        this.bodySprite = scene.add.sprite(x, y, base.id)
        this.bodySprite.setOrigin(0.13, 0.5)

        // Setup the focus sprite
        if (this.isPlayer) {
            this.focusSprite = scene.add.sprite(x, y, "focusBackdrop")
            this.focusSprite.setOrigin(0.13, 0.5)
        }

        // Setup clothes (always set to true for non-player birds)
        this.tightAttire = meta.settings.aesthetics.attire
            .filter(a => !a.base)
            .filter(a => !meta.isPlayer || a.fit === "tight")
            .map(a => {
                const image = scene.add.image(x, y, a.id)
                image.setOrigin(0.13, 0.55)
                return image
            })

        // See updateRelatedSprite for more info
        this.looseAttire = meta.settings.aesthetics.attire
            .filter(a => !a.base && meta.isPlayer)
            .filter(a => a.fit === "loose")
            .map(a => {
                const image = scene.add.image(x, y, a.id)
                image.setOrigin(0.13, 0.55)
                return image
            })

        this.sprite = scene.physics.add.sprite(x, y, "flap1")
        this.sprite.setOrigin(0.13, 0.6)

        // Set up
        this.body = this.sprite.body as Phaser.Physics.Arcade.Body
        this.isInBus = true

        this.position = this.body.position
        const allAttire = this.tightAttire.concat(this.looseAttire)
        if (!meta.isPlayer) {
            this.bodySprite.setAlpha(0.3)
            this.sprite.setAlpha(0.3)
            allAttire.forEach(a => a.setAlpha(0.3))
        } else {
            this.bodySprite.setDepth(constants.zLevels.playerBird)
            if (this.isPlayer) this.focusSprite.setDepth(constants.zLevels.focusBackdrop)
            this.sprite.setDepth(constants.zLevels.birdWings)
            allAttire.forEach(a => (a.depth = constants.zLevels.birdAttire + 1))
        }

        scene.sys.events.addListener("postupdate", () => {
            this.updateRelatedSprites({ tight: true })
        })
    }

    addCollideForSprite(scene: Scene, otherPhysicsObj: Phaser.Physics.Arcade.Image) {
        scene.physics.add.collider(this.sprite, otherPhysicsObj)
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
        this.scene.sound.play("flap")
    }

    rotateSprite() {
        if (this.body.velocity.y >= 100) {
            this.sprite.play("dive")
        }

        let newAngle = remapClamped(this.body.velocity.y, 105, 200, -15, 90)
        this.sprite.setAngle(newAngle)

        const defaultWidth = 17
        const defaultHeight = 11
        let physicsWidth = remapClamped(this.body.velocity.y, 105, 200, defaultWidth - 2, 12 - 2)
        let physicsHeight = remapClamped(this.body.velocity.y, 105, 200, defaultHeight - 2, 16 - 2)

        this.sprite.body.setSize(physicsWidth, physicsHeight)
        this.sprite.body.offset = new Phaser.Math.Vector2(
            remapClamped(this.body.velocity.y, 105, 200, -1, 3) * -1,
            remapClamped(this.body.velocity.y, 105, 200, 1, 8)
        )
    }

    destroy() {
        const sprites = [this.bodySprite, this.sprite, ...this.tightAttire, ...this.looseAttire]
        sprites.forEach(s => s.destroy())
    }

    die(velocity?: number) {
        // move with the pipes
        if (typeof velocity !== "undefined") {
            this.body.setVelocityX(velocity)
        }
        this.isDead = true

        if (this.isPlayer) this.scene.sound.play("hit")
        else this.scene.sound.play("other_hit")
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
        this.isAtRest = true
        this.sprite.setGravityY(constants.gravity * -1)
        const sprites = [this.bodySprite, this.sprite, ...this.tightAttire, ...this.looseAttire]
        sprites.forEach(a => a.setAlpha(1))
        this.sprite.play("flap")
        this.sprite.setAngle(0)
    }

    hasHitFloor() {
        this.isAtRest = true
        this.sprite.setGravityY(constants.gravity * -1)
        this.sprite.setVelocityY(0)
    }

    // When a player dies in royale, the rest if the birds move forwards
    startMovingLeft() {
        this.sprite.setVelocityX(constants.pipeSpeed)
    }

    updateRelatedSprites(settings: { tight: boolean }) {
        if (!this.sprite.anims) return

        // When the bird has hit the floor, stop running rotations
        // also, only do it once per render run.
        if (!this.isAtRest && settings.tight) {
            this.rotateSprite()
        }

        // We can't attach physics bodies together
        // so attire is just manually kept up to date with the positioning
        // of the sprite, this means attire needs to be centered on the bird

        this.bodySprite.setPosition(this.sprite.x, this.sprite.y)
        this.bodySprite.rotation = this.sprite.rotation

        if (this.isPlayer) {
            this.focusSprite.setPosition(this.sprite.x, this.sprite.y)
            this.focusSprite.rotation = this.sprite.rotation
        }
        // There are two loops, one that is done _after_ the physics resolution
        // layer (coming from scene.sys.events.addListener("postupdate") above )
        // and another coming from the 'preUpdate' loop which comes from the game
        // which occurs before physics is decided.
        //
        // This means that attire in the before loop is exactly up to date with
        // the body, and the after one just happens to be a tick out. This tick out
        // ends up giving this really cool effect of bouncing attire as though the
        // item is loosely held.
        //
        // Note: This function will only be called with loose attire  on the player
        const attireCount = settings.tight ? this.tightAttire : this.looseAttire
        attireCount.forEach(item => {
            item.setPosition(this.bodySprite.x, this.bodySprite.y)
            item.rotation = this.bodySprite.rotation
        })
    }
}

const remapClamped = (value: number, fromA: number, fromB: number, toA: number, toB: number) => {
    value = Math.min(Math.max(value, fromA), fromB)
    value = toA + (toB - toA) * ((value - fromA) / (fromB - fromA))

    return value
}
