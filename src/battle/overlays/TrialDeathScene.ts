import { GameWidth, GameHeight, zLevels, GameAreaTopOffset } from "../../constants"
import * as Phaser from "phaser"
import { launchMainMenu } from "../../menus/MainMenuScene"
import { BattleScene, getNumberWithOrdinal } from "../Scene"
import { becomeButton } from "../../menus/utils/becomeButton"
import {
    getRoyales,
    livesExtensionStateForSeed,
    livesExtensionsButtonTitleForState,
    LifeStateForSeed,
    bumpLivesExtensionState,
    addLives,
    getLives,
    getUserSettings,
    getUserStatistics,
    UserSettings
} from "../../user/userManager"
import { requestReview } from "../../nativeComms/requestReview"
import { requestModalAd } from "../../nativeComms/requestModalAd"
import { centerAlignTextLabel } from "../utils/alignTextLabel"
import { BirdSprite } from "../BirdSprite"
import { PlayerData } from "../../firebase"

export interface TrialDeathProps {
    score: number
    lives: number
    position: number
    battle: BattleScene
    totalPlayers: number
    livesState: LifeStateForSeed
    seed: string
    replays: PlayerData[]
}

export const deathPreload = (game: Phaser.Scene) => {
    game.load.image("green-sash", require("../../../assets/menu/GreenSash.png"))
    game.load.image("white-sash", require("../../../assets/menu/WhiteSash.png"))
    game.load.image("share-ios", require("../../../assets/menu/share-ios.png"))
    game.load.image("red-sash", require("../../../assets/menu/RedSash.png"))
    game.load.image("green-sash-small", require("../../../assets/menu/GreenSashSmall.png"))
    game.load.image("footer-bg", require("../../../assets/menu/BottomSash.png"))
    game.load.image("back", require("../../../assets/menu/Back2.png"))
    game.load.image("medal", require("../../../assets/battle/best-medal.png"))
    game.load.image("button-small-bg", require("../../../assets/menu/ButtonSmallBG.png"))
    game.load.image("button-bg", require("../../../assets/menu/ButtonBG.png"))
    game.load.image("white-circle", require("../../../assets/menu/Circle.png"))

    game.load.bitmapFont(
        "fipps-bit",
        require("../../../assets/fonts/fipps.png"),
        require("../../../assets/fonts/fipps.fnt")
    )
    game.load.bitmapFont(
        "fipps-bit-black",
        require("../../../assets/fonts/fipps-black.png"),
        require("../../../assets/fonts/fipps.fnt")
    )
}

export class TrialDeath extends Phaser.Scene {
    constructor(id: string, public props: TrialDeathProps) {
        super(id)
    }

    againButton: Phaser.GameObjects.BitmapText

    preload() {
        deathPreload(this)
    }

    create() {
        const userData: PlayerData = {
            score: this.props.score,
            actions: [],
            timestamp: 0,
            user: getUserSettings()
        }

        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0x000000, 0.5)

        const won = this.props.position === 0
        const firstPipeFail = this.props.score === 0

        if (this.props.position === 0) {
            this.cameInFirst(userData)
        } else if (this.props.position <= 2) {
            this.cameInTopThree(userData)
        } else {
            this.didntComeTopThree(userData)
        }

        let message = "Splat!"
        if (firstPipeFail) {
            message = "Fail!"
        } else if (won) {
            message = "You're #1!!!"
        }

        // const sash = won ? "green-sash" : "red-sash"
        // this.add.image(80, 70, sash)
        // this.add.bitmapText(10, 44, "fipps-bit", message, 24)

        // let pipes = this.props.score === 1 ? "pipe" : "pipes"
        // this.add.image(60, 110, "green-sash-small")
        // this.add.bitmapText(10, 107, "fipps-bit", `${this.props.score} ${pipes}`, 8)

        const settings = getUserStatistics()
        if (this.props.score >= settings.bestScore && this.props.score > 0) {
            this.time.delayedCall(500, this.addTopMedal, [], this)
        }

        // this.add.image(60, 142, "green-sash-small")
        // const place = `${getNumberWithOrdinal(this.props.position)} place`
        // this.add.bitmapText(10, 138, "fipps-bit", place, 8)

        // this.add.image(60, 172, "green-sash-small")
        // const tries = this.props.lives === 1 ? "try" : "tries"
        // const copy = `${this.props.lives} ${tries} left`
        // this.add.bitmapText(10, 168, "fipps-bit", copy, 8)

        this.addFooter()

        // Decide whether to show a rating screen
        // WARNING: iOS will silently not display this if it's already been shown, so we can call this indefinitely
        // When building this out for Android, it's likely that won't be the case.
        if (this.props.score > 0 && getRoyales().length >= 10) {
            requestReview()
        }
    }

    private addFooter() {
        this.add.image(80, GameHeight - 8, "footer-bg")

        const back = this.add.image(16, GameHeight - 20, "back")
        becomeButton(back, this.backToMainMenu, this)

        const newGame = this.add.image(90, GameHeight - 20, "button-bg")
        let againText = "AGAIN"

        const outOfLives = this.props.lives <= 0
        if (outOfLives) {
            againText = livesExtensionsButtonTitleForState(this.props.livesState)
        }

        const newGameText = this.add.bitmapText(GameWidth / 2, GameHeight - 27, "fipps-bit", againText, 8)
        centerAlignTextLabel(newGameText, -10)
        becomeButton(newGame, this.again, this, [newGameText])
        this.againButton = newGameText

        const share = this.add.image(125, GameHeight - 51, "button-small-bg")
        share.setScale(0.6, 1)
        const shareIcon = this.add.image(125, GameHeight - 51, "share-ios")
        becomeButton(share, this.shareStats, this, [shareIcon])
    }

    private cameInFirst(player: PlayerData) {
        const top = GameAreaTopOffset

        // TOP BIT

        // The green BG is two sashes
        this.add.image(80, top + 40, "green-sash")
        this.add.image(80, top + 30, "green-sash")
        this.add.image(80, top + 50, "green-sash").toggleFlipX()
        this.add.image(80, top + 60, "green-sash").toggleFlipX()

        // White
        this.add.rectangle(92, top + 48, 160, 34, 0xffffff)

        // white circle for bird + pos
        const circle = this.add.image(40, top + 40, "white-circle")
        circle.setScale(1.6, 1.6)

        const settings = getUserSettings()
        const bird = new BirdSprite(this, 33, top + 18, { isPlayer: false, settings: settings })
        bird.actAsImage()

        // 1st of x
        this.add.bitmapText(10, top + 20, "fipps-bit-black", "1st", 24)
        const ofX = this.add.bitmapText(26, top + 56, "fipps-bit-black", `of ${this.props.totalPlayers}`, 8)
        ofX.x = 40 - ofX.width / 2 // makes it centered

        // Username + score
        this.add.bitmapText(80, top + 34, "fipps-bit-black", settings.name, 8)
        const pipes = this.props.score === 1 ? "pipe" : "pipes"
        this.add.bitmapText(80, top + 48, "fipps-bit-black", `${this.props.score} ${pipes}`, 8)

        /// MIDDLE BIT

        this.drawPlayerRow({ position: 2, white: true, x: 14, y: top + 90, opacity: 0.6 }, player)
        this.drawPlayerRow({ position: 3, white: true, x: 14, y: top + 110, opacity: 0.4 }, player)
        this.drawPlayerRow({ position: 4, white: true, x: 14, y: top + 130, opacity: 0.2 }, player)

        /// BOTTOM BIT

        // BG for bottom left
        this.add.image(-20, GameHeight - 70, "green-sash")
        this.add.bitmapText(8, GameHeight - 86, "fipps-bit", "Win", 16)

        this.add.image(20, GameHeight - 48, "green-sash")
        const userScores = getUserStatistics()
        const pos = getNumberWithOrdinal(userScores.trialSpecificWins)
        this.add.bitmapText(8, GameHeight - 56, "fipps-bit", `${pos} trial win`, 8)
    }

    private cameInTopThree(player: PlayerData) {
        const top = GameAreaTopOffset
        const playerIsTwo = this.props.position === 1
        const playerIsThree = this.props.position === 2

        /// TOP-MIDDLE BIT
        this.add.image(80, top + 50, "red-sash").toggleFlipX()
        this.add.image(80, top + 78, "red-sash").toggleFlipX()
        this.add.image(80, top + 90, "red-sash")
        this.add.image(80, top + 70, "red-sash")

        // white circle for your bird + pos
        const yOffset = playerIsTwo ? 0 : 20

        this.add.image(80, top + 70 + yOffset, "white-sash")
        const circle = this.add.image(48, top + 70 + yOffset, "white-circle")
        circle.setScale(0.8, 0.8)

        const sorted = this.props.replays.sort((l, r) => r.score - l.score)

        const one = sorted[0]
        const two = playerIsTwo ? player : sorted[1]
        const three = playerIsThree ? player : sorted[1]

        this.drawPlayerRow({ position: 0, white: true, x: 14, y: top + 50, opacity: 1 }, one)
        this.drawPlayerRow({ position: 1, white: !playerIsTwo, x: 14, y: top + 70, opacity: 1 }, two)
        if (three) {
            // possible you could be 2 in 2
            this.drawPlayerRow({ position: 2, white: !playerIsThree, x: 14, y: top + 90, opacity: 1 }, three)
        }

        /// BOTTOM BIT

        this.add.image(-16, GameHeight - 70, "red-sash")
        this.add.bitmapText(8, GameHeight - 86, "fipps-bit", "FAIL", 16)

        this.add.image(20, GameHeight - 48, "red-sash")
        const lives = getLives(this.props.seed)
        this.add.bitmapText(8, GameHeight - 56, "fipps-bit", `${lives} lives left`, 8)
    }

    private didntComeTopThree(player: PlayerData) {
        const top = GameAreaTopOffset

        const sorted = this.props.replays.sort((l, r) => r.score - l.score)

        // TOP BIT
        this.add.rectangle(80, 0, 160, 110, 0xd49d9d)
        this.add.rectangle(82, 2, 160, 110, 0xd49d9d)
        this.add.rectangle(84, 4, 160, 110, 0xd49d9d)
        this.add.rectangle(96, 6, 160, 110, 0xd49d9d)

        this.drawPlayerRow({ position: 0, white: true, x: 10, y: top + 10, opacity: 1 }, sorted[0])
        this.drawPlayerRow({ position: 1, white: true, x: 10, y: top + 30, opacity: 1 }, sorted[1])
        this.drawPlayerRow({ position: 2, white: true, x: 10, y: top + 50, opacity: 1 }, sorted[2])

        // MIDDLE

        const yOffset = 34
        this.add.image(80, top + 50 + yOffset, "red-sash").toggleFlipX()
        this.add.image(80, top + 78 + yOffset, "red-sash").toggleFlipX()
        this.add.image(80, top + 90 + yOffset, "red-sash")
        this.add.image(80, top + 70 + yOffset, "red-sash")

        // white circle for your bird + pos
        this.add.image(80, top + 70 + yOffset, "white-sash")
        const circle = this.add.image(48, top + 70 + yOffset, "white-circle")
        circle.setScale(0.8, 0.8)

        const abovePlayer = sorted[this.props.position - 1]
        const belowPlayer = sorted[this.props.position]

        this.drawPlayerRow(
            { position: this.props.position - 1, white: true, x: 14, y: top + 50 + yOffset, opacity: 1 },
            abovePlayer
        )
        this.drawPlayerRow(
            { position: this.props.position, white: false, x: 14, y: top + 70 + yOffset, opacity: 1 },
            player
        )
        if (belowPlayer) {
            // possible you could be 2 in 2
            this.drawPlayerRow(
                { position: this.props.position + 1, white: true, x: 14, y: top + 90 + yOffset, opacity: 1 },
                belowPlayer
            )
        }

        // END
        this.add.image(-16, GameHeight - 70, "red-sash")
        this.add.bitmapText(8, GameHeight - 86, "fipps-bit", "FAIL", 16)

        this.add.image(20, GameHeight - 48, "red-sash")
        const lives = getLives(this.props.seed)
        this.add.bitmapText(8, GameHeight - 56, "fipps-bit", `${lives} lives left`, 8)
    }

    private drawPlayerRow(
        config: { white: boolean; opacity: number; position: number; x: number; y: number },
        player: PlayerData
    ) {
        const font = config.white ? "fipps-bit" : "fipps-bit-black"

        this.add.bitmapText(config.x, config.y - 8, font, `#${config.position + 1}`, 8).setAlpha(config.opacity)

        const bird = new BirdSprite(this, config.x + 28, config.y, { isPlayer: false, settings: player.user })
        bird.actAsImage()
        bird.setOpacity(config.opacity)

        this.add.bitmapText(config.x + 52, config.y - 8, font, player.score.toString(), 8).setAlpha(config.opacity)

        this.add.bitmapText(config.x + 86, config.y - 8, font, player.user.name, 8).setAlpha(config.opacity)
    }

    private again() {
        if (getLives(this.props.seed) <= 0) {
            requestModalAd(this.props.livesState)
            return
        }

        this.game.scene.remove(this)
        this.props.battle.restartTheGame()
    }

    private shareStats() {
        const won = this.props.position === 0
        const firstPipeFail = this.props.score === 0

        if (navigator && "share" in navigator) {
            const n = navigator as any
            const lossMessage = `I managed to get past ${this.props.score} pipes on today's Flappy Royale daily Trial!`
            const winMessage = `I have the high score for today's Flappy Royale daily Trial! Think you can beat ${
                this.props.score
            }?`
            const firstPipeFailMessage = "I died on the first pipe in today's Flappy Royale daily trial!"

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

    private addTopMedal() {
        const top = GameAreaTopOffset
        const medalX = GameWidth - 52
        const medalY = top + 16
        this.add.image(medalX, medalY, "medal").setScale(0.5, 0.5)
        this.add.bitmapText(GameWidth - 36, medalY - 6, "fipps-bit", "BEST", 8)

        // Do some cute little trash bounces
        const trash1 = this.physics.add.image(medalX, medalY, "trash-1")
        trash1.setVelocity(70, -150)
        trash1.setDepth(zLevels.birdWings + 2)

        const trash2 = this.physics.add.image(medalX, medalY, "trash-2")
        trash2.setVelocity(-80, -70)
        trash2.setDepth(zLevels.birdWings + 2)

        const trash3 = this.physics.add.image(medalX, medalY, "trash-3")
        trash3.setVelocity(-60, -20)
        trash3.setDepth(zLevels.birdWings + 2)

        const trash4 = this.physics.add.image(medalX, medalY, "trash-3")
        trash4.setVelocity(-75, -100)
        trash4.setDepth(zLevels.birdWings + 2)
        trash4.setAngle(90)

        const trash5 = this.physics.add.image(medalX, medalY, "trash-2")
        trash5.setVelocity(-75, -150)
        trash5.setDepth(zLevels.birdWings + 2)
        trash5.setAngle(180)

        const trash6 = this.physics.add.image(medalX, medalY, "trash-3")
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

    adsHaveBeenUnlocked() {
        const seed = this.props.seed
        bumpLivesExtensionState(seed)

        let livesToAdd = 0
        switch (livesExtensionStateForSeed(seed)) {
            case LifeStateForSeed.ExtraFive:
                livesToAdd = 5
                break

            case LifeStateForSeed.ExtraTen:
                livesToAdd = 10
                break

            case LifeStateForSeed.ExtraFifteen:
                livesToAdd = 15
                break
        }

        addLives(seed, livesToAdd)

        setTimeout(() => {
            alert(
                `Thanks for supporting Flappy Royale! You've earned an additional ${livesToAdd} tries for today's Daily Trial.`
            )
        }, 200)

        this.againButton.setText("again")
        centerAlignTextLabel(this.againButton, -10)
    }
}
