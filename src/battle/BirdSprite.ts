import * as constants from "../constants"
import { Scene } from "phaser"

import { UserSettings, getUserSettings, Bird } from "../user/userManager"
import { BattleScene } from "./Scene"
import { haptics } from "../haptics"
import { becomeButton } from "../menus/utils/becomeButton"
import { builtInAttire, Attire, defaultAttire } from "../attire"
import _ = require("lodash")
import { playSound } from "../playSound"
import { getSettings } from "../gameSettings"

export const preloadBirdSprites = (scene: BattleScene | Scene) => {
    scene.load.image("flap1", require("../../assets/battle/Flap1.png"))
    scene.load.image("flap2", require("../../assets/battle/Flap2.png"))
    scene.load.image("flap3", require("../../assets/battle/Flap3.png"))

    scene.load.image("focusBackdrop", require("../../assets/bases/focusSprite.png"))

    // Preload user attire
    const userSettings = getUserSettings()
    preloadBirdAttire(scene, userSettings.aesthetics.attire)
}

export const preloadBirdAttire = (scene: Phaser.Scene, attire: Attire[]) => {
    for (const piece of attire) {
        scene.load.image(piece.id, piece.href)
    }
}

export const preloadAllBirdAttire = (scene: Phaser.Scene) => {
    for (const attire of builtInAttire) {
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
    isImage: boolean = false
    isInBus: boolean
    isDead: boolean = false
    isAtRest: boolean = false

    // The bird itself
    private bodySprite: Phaser.GameObjects.Sprite

    // Actually the wings
    // NOTE: This is public so I can futz with it more easily in the tutorial
    // but in general you shouldn't touch this ;)
    public sprite: Phaser.Physics.Arcade.Sprite

    // Focus sprite
    private focusSprite: Phaser.GameObjects.Image
    // HATS
    private tightAttire: Phaser.GameObjects.Image[] = []
    private looseAttire: Phaser.GameObjects.Image[] = []
    // the physics representation of the bird
    private body: Phaser.Physics.Arcade.Body

    private scene: Scene
    // Don't apply gravity / velocity etc during the constructor
    // because this is used for previews
    //
    constructor(scene: Scene, x: number, y: number, meta: { isPlayer: boolean; isImage?: boolean; settings: Bird }) {
        this.isPlayer = meta.isPlayer
        this.isImage = meta.isImage || false

        this.scene = scene

        // Setup the base body
        const base = meta.settings.aesthetics.attire.find(a => a.base)
        if (!base) throw "No base attire found"

        const baseID = scene.load.textureManager.exists(base.id) ? base.id : defaultAttire.id
        this.bodySprite = scene.add.sprite(x, y, baseID)
        this.bodySprite.setOrigin(0.13, 0.5)

        // Setup the focus sprite
        if (this.isPlayer) {
            this.focusSprite = scene.add.sprite(x, y, "focusBackdrop")
            this.focusSprite.setOrigin(0.13, 0.5)
        }

        if (!getSettings().lowPerformanceMode || (this.isPlayer || this.isImage)) {
            // Setup clothes (always set to true for non-player birds)
            this.tightAttire = meta.settings.aesthetics.attire
                .filter(a => !a.base && scene.load.textureManager.exists(a.id))
                .filter(a => !meta.isPlayer || a.fit === "tight")
                .map(a => {
                    const image = scene.add.image(x, y, a.id)
                    image.setOrigin(0.13, 0.55)
                    return image
                })

            // See updateRelatedSprite for more info
            this.looseAttire = meta.settings.aesthetics.attire
                .filter(a => !a.base && meta.isPlayer && scene.load.textureManager.exists(a.id))
                .filter(a => a.fit === "loose")
                .map(a => {
                    const image = scene.add.image(x, y, a.id)
                    image.setOrigin(0.13, 0.55)
                    return image
                })
        }

        this.sprite = scene.physics.add.sprite(x, y, "flap1")
        this.sprite.setOrigin(0.13, 0.6)

        // Set up
        this.body = this.sprite.body as Phaser.Physics.Arcade.Body
        this.isInBus = true

        this.position = this.body.position
        const allAttire = this.tightAttire.concat(this.looseAttire)
        if (!meta.isPlayer) {
            this.setOpacityBasedOnScore(0)
        } else {
            this.bodySprite.setDepth(constants.zLevels.playerBird)
            if (this.isPlayer) this.focusSprite.setDepth(constants.zLevels.focusBackdrop)
            this.sprite.setDepth(constants.zLevels.birdWings)
            allAttire.forEach(a => (a.depth = constants.zLevels.birdAttire + 1))
        }

        scene.sys.events.addListener("postupdate", () => {
            this.updateRelatedSprites({ tight: true })
        })

        if (this.isImage) {
            this.actAsImage()
        }
    }

    setOpacityBasedOnScore(pipes: number) {
        if (this.isPlayer) {
            return
        }

        let opacity = 0.3
        const map = {
            0: 0.2,
            1: 0.25,
            2: 0.3
        }

        if (!_.isUndefined(map[pipes])) {
            opacity = map[pipes]
        }
        this.setOpacity(opacity)
    }

    addCollideForSprite(scene: Scene, otherPhysicsObj: Phaser.Physics.Arcade.Image) {
        scene.physics.add.collider(this.sprite, otherPhysicsObj)
    }

    checkCollision(
        scene: Scene,
        objects: Phaser.Types.Physics.Arcade.ArcadeColliderType,
        callback: ArcadePhysicsCallback
    ) {
        return scene.physics.overlap(this.sprite, objects, callback, undefined, scene)
    }

    flap() {
        if (this.isInBus) {
            this.isInBus = false
            this.stopBeingInBus()
        }

        this.body.setVelocityY(-1 * constants.flapStrength)
        this.sprite.play("flap")

        if (this.isPlayer) {
            playSound(this.scene, "flap")

            haptics.playSelection()
            haptics.prepareHeavy()
        } else {
            playSound(this.scene, "other_flap")
        }
    }

    setOpacity(opacity: number) {
        this.bodySprite.setAlpha(opacity)
        this.sprite.setAlpha(opacity)

        const allAttire = this.tightAttire.concat(this.looseAttire)
        allAttire.forEach(a => a.setAlpha(opacity))
    }

    setScale(scale: number) {
        this.bodySprite.setScale(scale, scale)
        this.sprite.setScale(scale, scale)

        const allAttire = this.tightAttire.concat(this.looseAttire)
        allAttire.forEach(a => a.setScale(scale, scale))
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

        if (this.isPlayer) {
            playSound(this.scene, "hit")
            haptics.playHeavy()
            haptics.prepareHeavy()
        } else {
            playSound(this.scene, "other_hit")
        }
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
        this.sprite.setAngle(0)
    }

    actAsUIElement() {
        this.actAsImage()

        const sprites = [this.bodySprite, this.sprite, ...this.tightAttire, ...this.looseAttire]
        sprites.forEach(a => a.setDepth(constants.zLevels.ui))
    }

    hasHitFloor() {
        if (!this.isAtRest) {
            this.isAtRest = true
            this.sprite.setGravityY(constants.gravity * -1)
            this.sprite.setVelocityY(0)

            haptics.playHeavy()
        }
    }

    // When a player dies in royale, the rest if the birds move forwards
    startMovingLeft(velocity = constants.pipeSpeed) {
        this.sprite.setVelocityX(velocity)
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
            item.setPosition(this.bodySprite.x - 1, this.bodySprite.y + 1)
            item.rotation = this.bodySprite.rotation
        })
    }

    changeAttireToRandom() {
        const bases = builtInAttire.filter(a => a.base)
        const base = bases[Math.floor(Math.random() * bases.length)]

        this.bodySprite.destroy()
        this.bodySprite = this.scene.add.sprite(this.sprite.x, this.sprite.y, base.id)
        this.bodySprite.setOrigin(0.13, 0.5)

        const hatsIsh = builtInAttire.filter(a => !a.base)
        const amountOfItems = Math.floor(Math.random() * 3)
        const hatsToWear = hatsIsh.sort(() => 0.5 - Math.random()).slice(0, amountOfItems)

        this.tightAttire.forEach(a => a.destroy())
        this.looseAttire.forEach(a => a.destroy())

        // Setup clothes (always set to true for non-player birds)
        this.tightAttire = hatsToWear
            .filter(a => !a.base)
            .filter(a => !this.isPlayer || a.fit === "tight")
            .map(a => {
                const image = this.scene.add.image(this.bodySprite.x, this.bodySprite.y, a.id)
                image.setOrigin(0.13, 0.55)
                image.setDepth(constants.zLevels.birdAttire + 1)
                return image
            })

        // See updateRelatedSprite for more info
        this.looseAttire = hatsToWear
            .filter(a => !a.base && this.isPlayer)
            .filter(a => a.fit === "loose")
            .map(a => {
                const image = this.scene.add.image(this.bodySprite.x, this.bodySprite.y, a.id)
                image.setOrigin(0.13, 0.55)
                image.setDepth(constants.zLevels.birdAttire + 1)
                return image
            })
    }

    /** Lets you pass a func through for when the image is tapped */
    makeClickable(func: Function, context?: any) {
        becomeButton(this.bodySprite, func, context)
    }
}

const remapClamped = (value: number, fromA: number, fromB: number, toA: number, toB: number) => {
    value = Math.min(Math.max(value, fromA), fromB)
    value = toA + (toB - toA) * ((value - fromA) / (fromB - fromA))

    return value
}
