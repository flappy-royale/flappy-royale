import { GameWidth, GameHeight, zLevels, GameAreaTopOffset, NotchOffset } from "../../constants"
import * as Phaser from "phaser"
import { launchMainMenu } from "../../menus/MainMenuScene"
import { BattleScene, getNumberWithOrdinal } from "../Scene"
import { becomeButton } from "../../menus/utils/becomeButton"
import {
    livesExtensionStateForSeed,
    livesExtensionsButtonTitleForState,
    LifeStateForSeed,
    bumpLivesExtensionState,
    addLives,
    getDailyTrialRuns,
    getLives,
    getUserSettings,
    getUserStatistics,
    Bird,
    DailyTrialRun,
    livesExtensionsButtonToAdID
} from "../../user/userManager"

import { requestModalAd, prepareModalAd } from "../../nativeComms/requestModalAd"
import { centerAlignTextLabel } from "../utils/alignTextLabel"
import { BirdSprite } from "../BirdSprite"
import { shareNatively } from "../../nativeComms/share"
import { setupLogoCornerImages, preloadBackgroundBlobImages } from "../../menus/utils/backgroundColors"
import { getTrialDeathLeaderboard, Leaderboard, LeaderboardResult } from "../../playFab"
import _ = require("lodash")
import { Prompt, showPrompt, PromptOptions } from "../../menus/Prompt"
import { isAndroidApp } from "../../nativeComms/deviceDetection"

export interface TrialDeathProps {
    lives: number
    battle: BattleScene
    livesState: LifeStateForSeed
    seed: string
    score: number
    isHighScore: boolean
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

    againButton!: Phaser.GameObjects.BitmapText
    footerObjects: (Phaser.GameObjects.Image | Phaser.GameObjects.BitmapText | Phaser.GameObjects.Rectangle)[] = []
    shareLogoObjects: (Phaser.GameObjects.Image | Phaser.GameObjects.BitmapText)[] = []

    preload() {
        deathPreload(this)
        preloadBackgroundBlobImages(this)
    }

    create() {
        // Fill the BG
        const bg = this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0x000000, 0.5)
        this.footerObjects.push(bg)

        this.addFooter()

        if (this.props.isHighScore) {
            getTrialDeathLeaderboard().then(leaderboard => {
                const { player } = leaderboard
                if (!player) {
                    console.log("ERROR: Trial death leaderboard did not contain player")
                    return
                }

                if (player.position === 0) {
                    this.cameInFirst(leaderboard)
                } else if (player.position <= 2) {
                    this.cameInTopThree(leaderboard)
                } else {
                    this.didntComeTopThree(leaderboard)
                }

                if (player.score === this.props.score && player.score > 0) {
                    this.time.delayedCall(500, this.addTopMedal, [player], this)
                }
            })
        } else {
            const dailyTrialRuns = getDailyTrialRuns(this.props.seed)
            const leaderboard = this.localTrialCacheToLeaderboard(dailyTrialRuns)
            const { player } = leaderboard
            if (!player) {
                console.log("ERROR: Trial death leaderboard did not contain player")
                return
            }

            if (player.position === 0) {
                this.cameInFirst(leaderboard)
            } else if (player.position <= 2) {
                this.cameInTopThree(leaderboard)
            } else {
                this.didntComeTopThree(leaderboard)
            }
        }
    }

    private addFooter() {
        const bg = this.add.image(80, GameHeight - 8, "footer-bg")
        this.footerObjects.push(bg)

        const back = this.add.image(16, GameHeight - 20, "back")
        becomeButton(back, this.backToMainMenu, this)
        this.footerObjects.push(back)

        const newGame = this.add.image(90, GameHeight - 20, "button-bg")
        this.footerObjects.push(newGame)

        let againText = "AGAIN"

        const outOfLives = this.props.lives <= 0
        if (outOfLives) {
            againText = livesExtensionsButtonTitleForState(this.props.livesState)
            const adID = livesExtensionsButtonToAdID(this.props.livesState)
            prepareModalAd(adID)
        }

        const newGameText = this.add.bitmapText(GameWidth / 2, GameHeight - 27, "fipps-bit", againText, 8)
        this.footerObjects.push(newGameText)
        centerAlignTextLabel(newGameText, -10)
        becomeButton(newGame, this.again, this, [newGameText])
        this.againButton = newGameText

        if (!isAndroidApp()) {
            const share = this.add.image(125, GameHeight - 51, "button-small-bg")
            share.setScale(0.6, 1)
            this.footerObjects.push(share)
            const shareIcon = this.add.image(125, GameHeight - 51, "share-ios")
            becomeButton(share, this.shareStats, this, [shareIcon])
            this.footerObjects.push(shareIcon)
        }
    }

    private cameInFirst(leaderboard: Leaderboard) {
        if (!leaderboard.player) {
            console.log("ERROR: Trial death leaderboard did not contain player")
            return
        }

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
        new BirdSprite(this, 33, top + 18, { isPlayer: false, isImage: true, settings: settings })

        // 1st of x
        this.add.bitmapText(10, top + 20, "fipps-bit-black", "1st", 24)

        // TODO: There's no obvious way to get the total number of leaderboard results with PlayFab
        // const ofX = this.add.bitmapText(26, top + 56, "fipps-bit-black", `of ${this.props.totalPlayers}`, 8)
        // ofX.x = 40 - ofX.width / 2 // makes it centered

        // Username + score
        this.add.bitmapText(80, top + 34, "fipps-bit-black", settings.name, 8)
        const pipes = leaderboard.player.score === 1 ? "pipe" : "pipes"
        this.add.bitmapText(80, top + 48, "fipps-bit-black", `${leaderboard.player.score} ${pipes}`, 8)

        /// MIDDLE BIT

        if (leaderboard.results[0])
            this.drawPlayerRow({ white: true, x: 12, y: top + 90, opacity: 0.6 }, leaderboard.results[0])
        if (leaderboard.results[1])
            this.drawPlayerRow({ white: true, x: 12, y: top + 110, opacity: 0.4 }, leaderboard.results[1])
        if (leaderboard.results[2])
            this.drawPlayerRow({ white: true, x: 12, y: top + 130, opacity: 0.2 }, leaderboard.results[2])

        /// BOTTOM BIT

        // BG for bottom left
        this.add.image(-20, GameHeight - 70, "green-sash")
        this.add.bitmapText(8, GameHeight - 86, "fipps-bit", "Win", 16)

        this.add.image(20, GameHeight - 48, "green-sash")
        const userScores = getUserStatistics()
        const pos = getNumberWithOrdinal(userScores.trialWins)
        this.add.bitmapText(8, GameHeight - 56, "fipps-bit", `${pos} win`, 8)
    }

    private cameInTopThree(leaderboard: Leaderboard) {
        if (!leaderboard.player) {
            console.log("ERROR: Trial death leaderboard did not contain player")
            return
        }

        const { player, results } = leaderboard

        const top = GameAreaTopOffset
        const playerIsTwo = player.position === 1
        const playerIsThree = player.position === 2

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

        this.drawPlayerRow({ white: true, x: 12, y: top + 50, opacity: 1 }, results[0])
        this.drawPlayerRow({ white: !playerIsTwo, x: 12, y: top + 70, opacity: 1 }, results[1])
        if (results[2]) {
            this.drawPlayerRow({ white: !playerIsThree, x: 12, y: top + 90, opacity: 1 }, results[2])
        }

        /// BOTTOM BIT

        this.footerObjects.push(this.add.image(-16, GameHeight - 70, "red-sash"))
        this.footerObjects.push(this.add.bitmapText(8, GameHeight - 86, "fipps-bit", "FAIL", 16))

        this.footerObjects.push(this.add.image(20, GameHeight - 48, "red-sash"))
        const lives = getLives(this.props.seed)
        this.footerObjects.push(this.add.bitmapText(8, GameHeight - 56, "fipps-bit", `${lives} lives left`, 8))
    }

    private didntComeTopThree(leaderboard: Leaderboard) {
        const { results } = leaderboard

        const top = GameAreaTopOffset

        // TOP BIT
        this.add.rectangle(80, top + 0, 160, 110, 0xd49d9d)
        this.add.rectangle(82, top + 2, 160, 110, 0xd49d9d)
        this.add.rectangle(84, top + 4, 160, 110, 0xd49d9d)
        this.add.rectangle(96, top + 6, 160, 110, 0xd49d9d)

        this.drawPlayerRow({ white: true, x: 4, y: top + 10, opacity: 1 }, results[0])
        this.drawPlayerRow({ white: true, x: 7, y: top + 30, opacity: 1 }, results[1])
        this.drawPlayerRow({ white: true, x: 10, y: top + 50, opacity: 1 }, results[2])

        // MIDDLE

        const yOffset = 34
        this.add.image(80, top + 50 + yOffset, "red-sash").toggleFlipX()
        this.add.image(80, top + 78 + yOffset, "red-sash").toggleFlipX()
        this.add.image(80, top + 90 + yOffset, "red-sash")
        this.add.image(80, top + 70 + yOffset, "red-sash")

        // white circle for your bird + pos
        this.add.image(80, top + 70 + yOffset, "white-sash")
        const circle = this.add.image(56, top + 70 + yOffset, "white-circle")
        circle.setScale(0.8, 0.8)

        if (results[3]) {
            this.drawPlayerRow({ white: true, x: 12, y: top + 50 + yOffset, opacity: 1 }, results[3])
        }

        if (results[4]) {
            this.drawPlayerRow({ white: false, x: 12, y: top + 70 + yOffset, opacity: 1 }, results[4])
        }

        if (results[5]) {
            this.drawPlayerRow({ white: true, x: 12, y: top + 90 + yOffset, opacity: 1 }, results[5])
        }

        // END
        this.footerObjects.push(this.add.image(-16, GameHeight - 70, "red-sash"))
        this.footerObjects.push(this.add.bitmapText(8, GameHeight - 86, "fipps-bit", "FAIL", 16))

        this.footerObjects.push(this.add.image(20, GameHeight - 48, "red-sash"))
        const lives = getLives(this.props.seed)
        this.footerObjects.push(this.add.bitmapText(8, GameHeight - 56, "fipps-bit", `${lives} lives left`, 8))
    }

    private drawPlayerRow(config: { white: boolean; opacity: number; x: number; y: number }, data: LeaderboardResult) {
        const font = config.white ? "fipps-bit" : "fipps-bit-black"

        let offset = config.x

        const place = this.add
            .bitmapText(offset, config.y - 8, font, `#${data.position + 1}`, 8)
            .setAlpha(config.opacity)

        offset += place.getTextBounds(true).local.width + 9

        // TODO: Generate birdSprite UserSettings from leaderboard
        const leaderboardBird: Bird = { name: data.name, aesthetics: { attire: data.attire } }
        const bird = new BirdSprite(this, offset - 2, config.y - 6, {
            isPlayer: false,
            isImage: true,
            settings: leaderboardBird
        })
        bird.setOpacity(config.opacity)

        offset += 21

        const scoreText = this.add
            .bitmapText(offset, config.y - 8, font, data.score.toString(), 8)
            .setAlpha(config.opacity)

        offset += scoreText.getTextBounds(true).local.width + 7

        this.add.bitmapText(offset, config.y - 8, font, data.name, 8).setAlpha(config.opacity)
    }

    private again() {
        if (getLives(this.props.seed) <= 0) {
            const adID = livesExtensionsButtonToAdID(this.props.livesState)
            requestModalAd(adID)
            return
        }

        this.game.scene.remove(this)
        this.props.battle.restartTheGame()
    }

    private shareStats(player: LeaderboardResult) {
        const won = player.position === 0
        const firstPipeFail = player.score === 0

        const lossMessage = `I managed to get past ${player.score} pipes on today's Flappy Royale Daily Trial! https://flappyroyale.io`
        const winMessage = `I have the high score for today's Flappy Royale Daily Trial! Think you can beat ${player.score}? https://flappyroyale.io`
        const firstPipeFailMessage =
            "I died on the first pipe in today's Flappy Royale Daily Trial! https://flappyroyale.io"

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
        this.game.scene.remove(this)
        this.game.scene.remove(this.props.battle)

        launchMainMenu(this.game)
    }

    private addTopMedal(player: LeaderboardResult) {
        const cameFirst = player.position === 0

        const top = GameAreaTopOffset
        const medalX = GameWidth - 52
        const medalY = cameFirst ? top + 16 : top + 160

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

        const options: PromptOptions = {
            title: `You've earned`,
            subtitle: `${livesToAdd} more tries!`,
            drawBgLayer: true,
            yes: "ok",
            completion: (response: boolean, prompt: Prompt) => {
                prompt.dismiss()
            }
        }

        showPrompt(options, this.game)

        this.againButton.setText("again")
        centerAlignTextLabel(this.againButton, -10)
    }

    private localTrialCacheToLeaderboard = (cache: DailyTrialRun[]): Leaderboard => {
        const settings = getUserSettings()
        const attire = settings.aesthetics.attire
        const sortedCache = _.sortBy(cache, "score").reverse()

        const lastRun = cache[cache.length - 1]

        const results = sortedCache.map((r, i) => {
            let name = r.timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
            if (r === lastRun) {
                name = "just now"
            }

            return {
                name,
                attire,
                position: i,
                score: r.score,
                userId: name
            }
        })

        const player = results.find(r => r.name === "just now")

        // This isn't obvious from the signature, but in the new leaderboard world, there should be at most 6 elements in leaderboard.

        let shrunkResults = results.slice(0, 3)
        if (player && player.position >= 3) {
            if (player.position - 1 >= 3) {
                shrunkResults.push(results[player.position - 1])
            }

            shrunkResults.push(results[player.position])

            if (results[player.position + 1]) {
                shrunkResults.push(results[player.position + 1])
            }
        }

        console.log(shrunkResults, player)
        return { results: shrunkResults, player }
    }
}
