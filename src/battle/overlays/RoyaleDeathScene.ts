import { GameWidth, GameHeight, zLevels, NotchOffset } from "../../constants"
import * as Phaser from "phaser"
import { launchMainMenu } from "../../menus/MainMenuScene"
import { BattleScene } from "../Scene"
import { becomeButton } from "../../menus/utils/becomeButton"
import { fetchRecordingsForSeed, SeedData } from "../../firebase"
import { getUserStatistics, getAndBumpUserCycleSeed } from "../../user/userManager"
import { addScene } from "../../menus/utils/addScene"
import { GameMode } from "../utils/gameMode"
import _ = require("lodash")
import { centerAlignTextLabel, rightAlignTextLabel } from "../utils/alignTextLabel"
import { shareNatively } from "../../nativeComms/share"
import { GameTheme } from "../theme"
import { setupLogoCornerImages } from "../../menus/utils/backgroundColors"
import { isAndroidApp } from "../../nativeComms/deviceDetection"

export interface RoyaleDeathProps {
    score: number
    position: number
    battle: BattleScene
    totalPlayers: number
}

export const deathPreload = (game: Phaser.Scene) => {
    game.load.image("share-ios", require("../../../assets/menu/share-ios.png"))
    game.load.image("green-sash", require("../../../assets/menu/GreenSash.png"))
    game.load.image("red-sash", require("../../../assets/menu/RedSash.png"))
    game.load.image("green-sash-small", require("../../../assets/menu/GreenSashSmall.png"))
    game.load.image("footer-bg", require("../../../assets/menu/BottomSash.png"))
    game.load.image("back", require("../../../assets/menu/Back2.png"))
    game.load.image("medal", require("../../../assets/battle/best-medal.png"))
    game.load.image("button-small-bg", require("../../../assets/menu/ButtonSmallBG.png"))
    game.load.image("button-bg", require("../../../assets/menu/ButtonBG.png"))
    game.load.bitmapFont(
        "fipps-bit",
        require("../../../assets/fonts/fipps.png"),
        require("../../../assets/fonts/fipps.fnt")
    )
}

export class RoyaleDeath extends Phaser.Scene {
    seed: string
    seedData: SeedData

    /** True if the user has pressed 'ready', but new seed data isn't available yet  */
    hasReadied: boolean = false

    newGameText: Phaser.GameObjects.BitmapText
    newGameBG: Phaser.GameObjects.Image

    footerObjects: (Phaser.GameObjects.Image | Phaser.GameObjects.BitmapText | Phaser.GameObjects.Rectangle)[] = []
    shareLogoObjects: (Phaser.GameObjects.Image | Phaser.GameObjects.BitmapText)[] = []

    constructor(id: string, public props: RoyaleDeathProps) {
        super(id)
    }

    preload() {
        deathPreload(this)
    }

    create() {
        getAndBumpUserCycleSeed().then(seed => {
            this.seed = seed
            fetchRecordingsForSeed(seed).then(seedData => {
                this.seedData = seedData

                if (this.hasReadied) {
                    this.startNewRound()
                }
            })
        })

        // Fill the BG
        const bg = this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0x000000, 0.5)
        this.footerObjects.push(bg)

        const won = this.props.position === 0
        const firstPipeFail = this.props.score === 0

        let message = "Splat!"
        if (firstPipeFail) {
            message = "Fail!"
        } else if (won) {
            message = "Win!!!"
        }

        const sash = won ? "green-sash" : "red-sash"
        this.add.image(80, 80, sash)
        this.add.bitmapText(10, 54, "fipps-bit", message, 24)

        this.add.image(60, 120, "green-sash-small")
        const pipes = this.props.score === 1 ? "pipe" : "pipes"
        this.add.bitmapText(10, 117, "fipps-bit", `${this.props.score} ${pipes}`, 8)

        const settings = getUserStatistics()
        if (this.props.score >= settings.bestScore && this.props.score > 0) {
            this.time.delayedCall(300, this.addTopMedal, [], this)
        }

        if (!won) {
            this.add.image(60, 152, "green-sash-small")
            const copy = `#${this.props.position + 1} / ${this.props.totalPlayers}`
            this.add.bitmapText(10, 148, "fipps-bit", copy, 8)
        }

        if (won) {
            const streak = settings.royaleStreak
            const streakText = this.add.bitmapText(0, 1 + NotchOffset, "fipps-bit", `win streak: ${streak}`, 8)

            let streakRecord: string =
                settings.bestRoyaleStreak && settings.bestRoyaleStreak > streak
                    ? `highest streak: ${settings.bestRoyaleStreak}`
                    : "personal best!"

            const streakRecordText = this.add.bitmapText(0, NotchOffset + 13, "fipps-bit", streakRecord, 8)

            rightAlignTextLabel(streakText, 3)
            rightAlignTextLabel(streakRecordText, 3)
        }

        this.footerObjects.push(this.add.image(80, GameHeight - 8, "footer-bg"))
        const back = this.add.image(16, GameHeight - 20, "back")
        this.footerObjects.push(back)

        this.newGameBG = this.add.image(90, GameHeight - 20, "button-bg")
        this.newGameText = this.add.bitmapText(71, GameHeight - 27, "fipps-bit", "READY", 8)
        this.footerObjects.push(this.newGameBG)
        this.footerObjects.push(this.newGameText)

        let share, shareIcon
        if (!isAndroidApp()) {
            share = this.add.image(55, GameHeight - 51, "button-small-bg")
            share.setScale(0.6, 1)
            shareIcon = this.add.image(55, GameHeight - 51, "share-ios")
            this.footerObjects.push(share)
            this.footerObjects.push(shareIcon)
        }

        // Let you hit ready with spacebar
        var spacekeyObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        spacekeyObj.on("up", this.getReady, this)

        setTimeout(() => {
            becomeButton(back, this.backToMainMenu, this)
            becomeButton(this.newGameBG, this.getReady, this, [this.newGameText])

            if (share) {
                becomeButton(share, this.shareStats, this, [shareIcon])
            }
        }, 200)
    }

    private shareStats() {
        const won = this.props.position === 0
        const firstPipeFail = this.props.score === 0

        const n = navigator as any
        const lossMessage = `I managed to get past ${this.props.score} pipes on Flappy Royale https://flappyroyale.io`
        const winMessage = `I won on Flappy Royale! https://flappyroyale.io`
        const firstPipeFailMessage = "I died on the first pipe in Flappy Royale! https://flappyroyale.io"

        let text = lossMessage
        if (won) text = winMessage
        if (firstPipeFail) text = firstPipeFailMessage

        shareNatively(text, this)
    }

    public showScreenshotUI() {
        this.footerObjects.forEach(o => o.setVisible(false))

        const offset = GameHeight - 70
        const logo = this.add.image(84, offset, "logo")
        const images = setupLogoCornerImages(this, offset)

        this.shareLogoObjects = [logo, ...images]
    }

    public removeScreenshotUI() {
        this.footerObjects.forEach(o => o.setVisible(true))
        this.shareLogoObjects.forEach(o => o.destroy())
    }

    private backToMainMenu() {
        _.defer(() => {
            this.game.scene.remove(this)
            this.game.scene.remove(this.props.battle)
            launchMainMenu(this.game)
        })
    }

    private getReady() {
        this.hasReadied = true
        if (this.seed && this.seedData) {
            this.startNewRound()
        } else {
            this.updateCounterLabel()
        }
    }

    private updateCounterLabel() {
        if (this.hasReadied) {
            this.newGameText.setText(`one sec...`)
            this.newGameBG.setAlpha(0.3)
            centerAlignTextLabel(this.newGameText, -9)
        }
    }

    private async startNewRound() {
        if (!(this.seed && this.seedData)) return

        _.defer(() => {
            this.game.scene.remove(this)
            this.game.scene.remove(this.props.battle)
        })

        const scene = new BattleScene({
            seed: this.seed,
            data: this.seedData,
            gameMode: GameMode.Royale,
            theme: GameTheme.default
        })
        addScene(this.game, "BattleScene" + this.seed, scene, true, {})
        scene.playBusCrash()
    }

    private addTopMedal() {
        this.add.image(90, 117, "medal")
        this.add.bitmapText(114, 110, "fipps-bit", "BEST", 8)

        // Do some cute little trash bounces
        const trash1 = this.physics.add.image(90, 120, "trash-1")
        trash1.setVelocity(70, -150)
        trash1.setDepth(zLevels.birdWings + 2)

        const trash2 = this.physics.add.image(90, 120, "trash-2")
        trash2.setVelocity(-80, -70)
        trash2.setDepth(zLevels.birdWings + 2)

        const trash3 = this.physics.add.image(90, 120, "trash-3")
        trash3.setVelocity(-60, -20)
        trash3.setDepth(zLevels.birdWings + 2)

        const trash4 = this.physics.add.image(90, 120, "trash-3")
        trash4.setVelocity(-75, -100)
        trash4.setDepth(zLevels.birdWings + 2)
        trash4.setAngle(90)

        const trash5 = this.physics.add.image(90, 120, "trash-2")
        trash5.setVelocity(-75, -150)
        trash5.setDepth(zLevels.birdWings + 2)
        trash5.setAngle(180)

        const trash6 = this.physics.add.image(90, 120, "trash-3")
        trash6.setVelocity(10, -160)
        trash6.setDepth(zLevels.birdWings + 2)
        trash6.setAngle(90)

        // give them a hint of spin
        const trash1Body = trash1.body as Phaser.Physics.Arcade.Body
        trash1Body.setAngularVelocity(2)

        const trash2body = trash2.body as Phaser.Physics.Arcade.Body
        trash2body.setAngularVelocity(4)

        const trash3Body = trash3.body as Phaser.Physics.Arcade.Body
        trash3Body.setAngularVelocity(-6)
    }
}
