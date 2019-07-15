import * as constants from "../constants"
import { Scene } from "phaser"

import { getUserSettings } from "../user/userManager"
import { Bird } from "../user/UserSettingsTypes"
import { BattleScene } from "./Scene"
import { haptics } from "../haptics"
import { becomeButton } from "../menus/utils/becomeButton"
import { Attire, defaultAttire } from "../attire"
import _ = require("lodash")
import { playSound } from "../playSound"
import { useLowQuality } from "../gameSettings"
import { defaultAttireSet } from "../attire/defaultAttireSet"

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
        if (piece && piece.id) {
            scene.load.image(piece.id, piece.href)
        }
    }
}

export const preloadAllBirdAttire = (scene: Phaser.Scene) => {
    for (const attire of defaultAttireSet.attire) {
        if (attire && attire.id) {
            scene.load.image(attire.id, attire.href)
        }
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

/**
 * OK, so rotation in a container is a bit complex. The bid shouldn't just rotate around
 * its center point, it needs to rotate around a fixed point behind and up a bit for it to feel right.
 *
 * In the original version we used `setOrigin` to move the point back and to the left, however that API
 * was relative to the size of the base/attire which meant if everything was the same png size it would look
 * right. This was fine with test data, but not fine once we hit artists who weren't us.
 *
 * Instead we put all the artwork into a container, where it's 0,0 is back in the top left because
 * we use internalXOffset and internalYOffset to move any images into the container at those pixel positions
 */

const internalXOffset = 5
const internalYOffset = -1

export class BirdSprite {
    position: Phaser.Math.Vector2

    isPlayer: boolean = false
    isImage: boolean = false
    isInBus: boolean
    isDead: boolean = false
    isAtRest: boolean = false

    // The bird base
    private baseSprite: Phaser.GameObjects.Sprite

    // The wings which animate above
    private wingsSprite: Phaser.GameObjects.Sprite

    // Actually the wings
    // NOTE: This is public so I can futz with it more easily in the tutorial
    // but in general you shouldn't touch this ;)
    public container: Phaser.GameObjects.Container

    // Focus sprite
    private focusSprite!: Phaser.GameObjects.Image
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
        if (meta.settings.aesthetics.attire.length === 0) {
            meta.settings.aesthetics.attire = [defaultAttire]
        }

        const base = meta.settings.aesthetics.attire.filter(a => !!a).find(a => a.base)
        if (!base) throw "No base attire found"

        const baseID = scene.load.textureManager.exists(base.id) ? base.id : defaultAttire.id
        this.baseSprite = scene.add.sprite(internalXOffset, internalYOffset, baseID)

        // Setup the focus sprite
        if (this.isPlayer) {
            this.focusSprite = scene.add.sprite(internalXOffset, internalYOffset, "focusBackdrop")
        }

        if (!useLowQuality() || (this.isPlayer || this.isImage)) {
            // Setup clothes (always set to true for non-player birds)
            this.tightAttire = meta.settings.aesthetics.attire
                .filter(a => !a.base && scene.load.textureManager.exists(a.id))
                .filter(a => !meta.isPlayer || a.fit === "tight")
                .map(a => scene.add.image(internalXOffset, internalYOffset, a.id))

            // See updateRelatedSprite for more info
            this.looseAttire = meta.settings.aesthetics.attire
                .filter(a => !a.base && meta.isPlayer && scene.load.textureManager.exists(a.id))
                .filter(a => a.fit === "loose")
                .map(a => scene.add.image(internalXOffset, internalYOffset, a.id))
        }

        this.container = scene.add.container(x, y)
        scene.physics.add.existing(this.container)

        this.body = this.container.body as Phaser.Physics.Arcade.Body
        this.wingsSprite = scene.add.sprite(internalXOffset, internalYOffset, "flap1")

        this.container.add(this.baseSprite)

        const allAttire = (this.tightAttire && this.looseAttire && this.tightAttire.concat(this.looseAttire)) || []
        // to retain player choice of ordering we add the containers based on the order of user attire settings
        meta.settings.aesthetics.attire.forEach(attire => {
            const foundImage = allAttire.find(i => i.texture.key === attire.id)
            if (foundImage) this.container.add(foundImage)
        })

        this.container.add(this.wingsSprite)
        // this.container.move

        /// TODO! this.container.setOrigin(0.13, 0.6)

        // Set up
        this.isInBus = true

        this.position = this.body.position

        if (!meta.isPlayer) {
            this.setOpacityBasedOnScore(0)
        } else {
            this.baseSprite.setDepth(constants.zLevels.playerBird)
            if (this.isPlayer) this.focusSprite.setDepth(constants.zLevels.focusBackdrop)
            this.container.setDepth(constants.zLevels.birdWings)
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

        // @ts-ignore
        if (!_.isUndefined(map[pipes])) {
            // @ts-ignore
            opacity = map[pipes]
        }
        this.setOpacity(opacity)
    }

    addCollideForSprite(scene: Scene, otherPhysicsObj: Phaser.Physics.Arcade.Image) {
        scene.physics.add.collider(this.container, otherPhysicsObj)
    }

    checkCollision(
        scene: Scene,
        objects: Phaser.Types.Physics.Arcade.ArcadeColliderType,
        callback: ArcadePhysicsCallback
    ) {
        return scene.physics.overlap(this.container, objects, callback, undefined, scene)
    }

    flap() {
        if (this.isInBus) {
            this.isInBus = false
            this.stopBeingInBus()
        }

        this.body.setVelocityY(-1 * constants.flapStrength)
        this.wingsSprite.play("flap")

        if (this.isPlayer) {
            playSound(this.scene, "flap")

            haptics.playSelection()
            haptics.prepareHeavy()
        } else {
            playSound(this.scene, "other_flap")
        }
    }

    setOpacity(opacity: number) {
        this.container.setAlpha(opacity)
    }

    setScale(scale: number) {
        this.baseSprite.setScale(scale, scale)
        this.container.setScale(scale, scale)

        const allAttire = this.tightAttire.concat(this.looseAttire)
        allAttire.forEach(a => a.setScale(scale, scale))
    }

    rotateSprite() {
        if (this.body.velocity.y >= 100) {
            this.wingsSprite.play("dive")
        }

        let newAngle = remapClamped(this.body.velocity.y, 105, 200, -15, 90)
        this.container.setAngle(newAngle)

        const defaultWidth = 17
        const defaultHeight = 14
        let physicsWidth = remapClamped(this.body.velocity.y, 105, 200, defaultWidth - 2, 12 - 2)
        let physicsHeight = remapClamped(this.body.velocity.y, 105, 200, defaultHeight - 2, 16 - 2)

        this.body.setSize(physicsWidth, physicsHeight)
        this.body.offset = new Phaser.Math.Vector2(
            remapClamped(this.body.velocity.y, 105, 200, -1, 8) * -1,
            remapClamped(this.body.velocity.y, 105, 200, -5, 2)
        )
    }

    destroy() {
        const sprites = [this.baseSprite, this.container, ...this.tightAttire, ...this.looseAttire]
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

    removeAttire() {
        this.tightAttire.forEach(s => s.destroy())
        this.looseAttire.forEach(s => s.destroy())

        this.tightAttire = []
        this.looseAttire = []
    }

    // Use the same gravity + velocity as the bus
    // until the bird first jumps and stop having x velocity
    // and a custom (slower) gravity

    setupForBeingInBus() {
        this.body.setGravityY(-450)
        this.body.setAccelerationX(20)
    }

    stopBeingInBus() {
        this.body.setGravityY(0)
        this.body.setAccelerationX(0)
        this.body.setVelocityX(0)
    }

    setupForTutorialBus() {
        this.body.setGravityY(-constants.gravity)
        this.body.setAccelerationX(20)
    }

    pauseInTutorialBus() {
        this.body.setAccelerationX(0)
        this.body.setVelocityX(0)
    }

    actAsImage() {
        this.isAtRest = true
        this.body.setGravityY(constants.gravity * -1)
        const sprites = [this.baseSprite, this.container, ...this.tightAttire, ...this.looseAttire]
        sprites.forEach(a => a.setAlpha(1))
        this.container.setAngle(0)
    }

    actAsUIElement() {
        this.actAsImage()

        const sprites = [this.baseSprite, this.container, ...this.tightAttire, ...this.looseAttire]
        sprites.forEach(a => a.setDepth(constants.zLevels.ui))
    }

    hasHitFloor() {
        if (!this.isAtRest) {
            this.isAtRest = true
            this.body.setGravityY(constants.gravity * -1)
            this.body.setVelocityY(0)

            haptics.playHeavy()
        }
    }

    // When a player dies in royale, the rest if the birds move forwards
    startMovingLeft(velocity = constants.pipeSpeed) {
        this.body.setVelocityX(velocity)
    }

    updateRelatedSprites(settings: { tight: boolean }) {
        if (!this.wingsSprite.anims) return

        // When the bird has hit the floor, stop running rotations
        // also, only do it once per render run.
        if (!this.isAtRest && settings.tight) {
            this.rotateSprite()
        }

        // We can't attach physics bodies together
        // so attire is just manually kept up to date with the positioning
        // of the sprite, this means attire needs to be centered on the bird

        // this.baseSprite.setPosition(this.container.x, this.container.y)
        // this.baseSprite.rotation = this.container.rotation

        // if (this.isPlayer) {
        //     this.focusSprite.setPosition(this.container.x, this.container.y)
        //     this.focusSprite.rotation = this.container.rotation
        // }
        // // There are two loops, one that is done _after_ the physics resolution
        // // layer (coming from scene.sys.events.addListener("postupdate") above )
        // // and another coming from the 'preUpdate' loop which comes from the game
        // // which occurs before physics is decided.
        // //
        // // This means that attire in the before loop is exactly up to date with
        // // the body, and the after one just happens to be a tick out. This tick out
        // // ends up giving this really cool effect of bouncing attire as though the
        // // item is loosely held.
        // //
        // // Note: This function will only be called with loose attire  on the player
        // const attireCount = settings.tight ? this.tightAttire : this.looseAttire
        // attireCount.forEach(item => {
        //     item.setPosition(this.baseSprite.x - 1, this.baseSprite.y + 1)
        //     item.rotation = this.baseSprite.rotation
        // })
    }

    changeAttireToRandom() {
        const bases = defaultAttireSet.attire.filter(a => a.base)
        const base = bases[Math.floor(Math.random() * bases.length)]

        this.baseSprite.destroy()
        this.baseSprite = this.scene.add.sprite(this.container.x, this.container.y, base.id)
        this.baseSprite.setOrigin(0.13, 0.5)

        const hatsIsh = defaultAttireSet.attire.filter(a => !a.base)
        const amountOfItems = Math.floor(Math.random() * 3)
        const hatsToWear = hatsIsh.sort(() => 0.5 - Math.random()).slice(0, amountOfItems)

        this.tightAttire.forEach(a => a.destroy())
        this.looseAttire.forEach(a => a.destroy())

        // Setup clothes (always set to true for non-player birds)
        this.tightAttire = hatsToWear
            .filter(a => !a.base)
            .filter(a => !this.isPlayer || a.fit === "tight")
            .map(a => {
                const image = this.scene.add.image(this.baseSprite.x, this.baseSprite.y, a.id)
                image.setOrigin(0.13, 0.55)
                image.setDepth(constants.zLevels.birdAttire + 1)
                return image
            })

        // See updateRelatedSprite for more info
        this.looseAttire = hatsToWear
            .filter(a => !a.base && this.isPlayer)
            .filter(a => a.fit === "loose")
            .map(a => {
                const image = this.scene.add.image(this.baseSprite.x, this.baseSprite.y, a.id)
                image.setOrigin(0.13, 0.55)
                image.setDepth(constants.zLevels.birdAttire + 1)
                return image
            })
    }

    /** Lets you pass a func through for when the image is tapped */
    makeClickable(func: Function, context?: any) {
        becomeButton(this.baseSprite, func, context)
    }
}

const remapClamped = (value: number, fromA: number, fromB: number, toA: number, toB: number) => {
    value = Math.min(Math.max(value, fromA), fromB)
    value = toA + (toB - toA) * ((value - fromA) / (fromB - fromA))

    return value
}
