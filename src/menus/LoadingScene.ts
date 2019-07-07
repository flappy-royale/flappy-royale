import * as Phaser from "phaser"
import * as constants from "../constants"
import { getUserSettings, UserSettings } from "../user/userManager"
import * as appCache from "../appCache"
import { preloadBirdSprites, setupBirdAnimations, BirdSprite, preloadBirdAttire } from "../battle/BirdSprite"
import { dog, hedgehog, sheep } from "../attire"

export const showLoadingScreen = (game: Phaser.Game) => {
    const loadingScene = new LoadingScene()
    game.scene.scenes.forEach(s => game.scene.remove(s))
    game.scene.add("LoadingScene", loadingScene, true)
}

export class LoadingScene extends Phaser.Scene {
    progressBar!: Phaser.GameObjects.Rectangle
    birds: BirdSprite[] = []
    possibleAttires: UserSettings[]

    constructor() {
        super("LoadingScene")

        const userBird = getUserSettings()
        this.possibleAttires = [
            { ...userBird, name: "", aesthetics: { attire: [dog] }, royale: { seedIndex: 1 } },
            { ...userBird, name: "", aesthetics: { attire: [hedgehog] }, royale: { seedIndex: 1 } },
            { ...userBird, name: "", aesthetics: { attire: [sheep] }, royale: { seedIndex: 1 } },
            userBird
        ]
    }

    preload() {
        preloadBirdSprites(this)
        this.possibleAttires.forEach(a => preloadBirdAttire(this, a.aesthetics.attire))

        this.load.image("underground", require("../../assets/battle/themes/default/ground-under.png"))
        this.load.image("pipe-end", require("../../assets/battle/themes/default/PipeBottom.png"))
        this.load.audio("other_flap", require("../../assets/audio/silence.wav"))

        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )
    }

    init() {
        appCache.onDownloadProgress((percent: number) => {
            console.log("Download!", percent)
            if (this.progressBar) this.progressBar.width = Math.round((percent * constants.GameWidth) / 2)
            // onDownloadEnd isn't 100% reliable
            // so this is a backup, where it'll call it with a bit of a delay
            // https://github.com/lazerwalker/flappy-royale/issues/102
            if (percent === 1) {
                setTimeout(() => {
                    localStorage.setItem("skipLaunchScreen", "true")
                    window.location.reload()
                }, 300)
            }
        })

        appCache.onDownloadEnd(() => {
            localStorage.setItem("skipLaunchScreen", "true")
            window.location.reload()
        })

        this.birds = []
    }

    create() {
        setupBirdAnimations(this)

        this.add.rectangle(
            constants.GameWidth / 2,
            constants.GameHeight / 2,
            constants.GameWidth,
            constants.GameHeight,
            0x53381f
        )

        this.add.image(constants.GameWidth / 2, 20, "underground").setScale(2, 2)
        const vCenter = constants.GameHeight / 2 + constants.NotchOffset

        this.add
            .image(14, vCenter, "pipe-end")
            .setScale(2, 2)
            .setAngle(90)
            .setDepth(constants.zLevels.ui)

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                const attire = this.possibleAttires[Math.floor(Math.random() * this.possibleAttires.length)]
                const bird = new BirdSprite(this, 20, vCenter, { isPlayer: false, settings: attire })
                bird.startMovingLeft()
                bird.setOpacity(1)
                bird.setScale(2)
                this.birds.push(bird)
            },
            callbackScope: this,
            loop: true
        })

        this.time.addEvent({
            delay: 100,
            callback: () => {
                this.birds.forEach(b => {
                    if (Math.floor(Math.random() * 4) !== 1) return
                    b.flap()
                    b.startMovingLeft()
                })
            },
            callbackScope: this,
            loop: true
        })

        this.add.bitmapText(40, constants.GameHeight / 2 + 50 + constants.NotchOffset, "nokia16", "Updating...")

        // Add loading box
        this.add.rectangle(constants.GameWidth / 2 - 2, vCenter + 80, constants.GameWidth / 2, 14, 0xffffff, 0.3)
        this.progressBar = this.add.rectangle(constants.GameWidth / 4 - 2, vCenter + 80, 0, 14, 0xffffff)
    }
}
