import { GameWidth, GameHeight, zLevels } from "../../constants"
import * as Phaser from "phaser"
import { launchMainMenu } from "../../menus/MainMenuScene"
import { BattleScene } from "../Scene"
import { becomeButton } from "../../menus/utils/becomeButton"
import { fetchRecordingsForSeed, SeedData } from "../../firebase"
import { getRoyales, getUserStatistics, getAndBumpUserCycleSeed } from "../../user/userManager"
import { requestReview } from "../../nativeComms/requestReview"
import { addScene } from "../../menus/utils/addScene"
import { GameMode } from "../utils/gameMode"
import _ = require("lodash")
import { centerAlignTextLabel } from "../utils/alignTextLabel"

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
    countdownComplete: boolean

    newGameText: Phaser.GameObjects.BitmapText
    newGameBG: Phaser.GameObjects.Image

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
            })
        })

        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0x000000, 0.5)

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
            const copy = `#${this.props.position} / ${this.props.totalPlayers}`
            this.add.bitmapText(10, 148, "fipps-bit", copy, 8)
        }

        this.add.image(80, GameHeight - 8, "footer-bg")
        const back = this.add.image(16, GameHeight - 20, "back")
        becomeButton(back, this.backToMainMenu, this)

        this.newGameBG = this.add.image(90, GameHeight - 20, "button-bg")
        this.newGameText = this.add.bitmapText(71, GameHeight - 27, "fipps-bit", "AGAIN", 8)
        becomeButton(this.newGameBG, this.startNewRound, this, [this.newGameText])

        const share = this.add.image(125, GameHeight - 51, "button-small-bg")
        share.setScale(0.6, 1)
        const shareIcon = this.add.image(125, GameHeight - 51, "share-ios")
        becomeButton(share, this.shareStats, this, [shareIcon])

        // Decide whether to show a rating screen
        // WARNING: iOS will silently not display this if it's already been shown, so we can call this indefinitely
        // When building this out for Android, it's likely that won't be the case.
        if (this.props.score > 0 && getRoyales().length >= 10) {
            requestReview()
        }

        // Start the countdown timer

        let countdownTime = _.random(2, 3) + 1
        let timeout: number | undefined
        const updateTimer = () => {
            countdownTime -= 1

            if (countdownTime <= 0) {
                this.countdownComplete = true
                this.newGameText.setText("AGAIN")
                this.newGameBG.setAlpha(1.0)
                centerAlignTextLabel(this.newGameText, -9)
            } else {
                this.newGameText.setText(`ready in ${countdownTime}`)
                this.newGameBG.setAlpha(0.3)
                centerAlignTextLabel(this.newGameText, -9)
                timeout = <number>(<unknown>setTimeout(updateTimer, 1000))
            }
        }
        updateTimer()

        this.events.on("destroy", () => {
            clearTimeout(timeout)
        })
    }

    private shareStats() {
        const won = this.props.position === 0
        const firstPipeFail = this.props.score === 0

        if (navigator && "share" in navigator) {
            const n = navigator as any
            const lossMessage = `I managed to get past ${this.props.score} pipes on Flappy Royale`
            const winMessage = `I won on Flappy Royale!`
            const firstPipeFailMessage = "I died on the first pipe in Flappy Royale!"

            let text = lossMessage
            if (won) {
                text = winMessage
            }
            if (firstPipeFail) {
                text = firstPipeFailMessage
            }

            n.share({
                title: "Flappy Royale",
                text: text,
                url: "https://flappyroyale.io"
            })
        }
    }

    private backToMainMenu() {
        this.game.scene.remove(this)
        this.game.scene.remove(this.props.battle)

        launchMainMenu(this.game)
    }

    private async startNewRound() {
        if (!this.countdownComplete) return
        if (!(this.seed && this.seedData)) return

        this.game.scene.remove(this)
        this.game.scene.remove(this.props.battle)

        const scene = new BattleScene({ seed: this.seed, data: this.seedData, gameMode: GameMode.Royale })
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
