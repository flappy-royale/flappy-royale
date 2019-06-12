import { APIVersion, GameWidth, GameHeight, zLevels } from "../../constants"
import * as Phaser from "phaser"
import { launchMainMenu } from "../../menus/MainMenuScene"
import { getNumberWithOrdinal, BattleScene } from "../Scene"
import { becomeButton } from "../../menus/utils/becomeButton"
import { getSeedsFromAPI } from "../../firebase"
import { getAndBumpUserCycleSeedIndex, getRoyales, getUserSettings, getUserStatistics } from "../../user/userManager"
import { RoyaleLobby } from "../../menus/RoyaleLobby"
import { requestReview } from "../../requestReview"

export interface RoyaleDeathProps {
    score: number
    position: number
    battle: BattleScene
    totalPlayers: number
}

export const deathPreload = (game: Phaser.Scene) => {
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
    constructor(id: string, public props: RoyaleDeathProps) {
        super(id)
    }

    preload() {
        deathPreload(this)
    }

    create() {
        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0x000000, 0.5)

        const won = this.props.position === 0
        const message = won ? "Win!!!" : "Splat!"
        const sash = won ? "green-sash" : "red-sash"
        this.add.image(80, 80, sash)
        this.add.bitmapText(10, 54, "fipps-bit", message, 24)

        this.add.image(60, 120, "green-sash-small")
        this.add.bitmapText(10, 117, "fipps-bit", `${this.props.score} pipes`, 8)

        const settings = getUserStatistics()
        if (this.props.score >= settings.bestScore) {
            this.time.delayedCall(300, this.addTopMedal, [], this)
        }

        if (!won) {
            this.add.image(60, 152, "green-sash-small")
            const copy = `${getNumberWithOrdinal(this.props.position)} out of ${this.props.totalPlayers}`
            this.add.bitmapText(10, 148, "fipps-bit", copy, 8)
        }

        this.add.image(80, GameHeight - 8, "footer-bg")
        const back = this.add.image(16, GameHeight - 20, "back")
        becomeButton(back, this.backToMainMenu, this)

        const newGame = this.add.image(90, GameHeight - 20, "button-bg")
        const newGameText = this.add.bitmapText(71, GameHeight - 27, "fipps-bit", "AGAIN", 8)
        becomeButton(newGame, this.goToRoyaleLobby, this, [newGameText])

        const share = this.add.image(130, GameHeight - 60, "button-small-bg")
        const shareText = this.add.bitmapText(110, GameHeight - 67, "fipps-bit", "SHARE", 8)
        becomeButton(share, this.shareStats, this, [shareText])

        // Decide whether to show a rating screen
        // WARNING: iOS will silently not display this if it's already been shown, so we can call this indefinitely
        // When building this out for Android, it's likely that won't be the case.
        if (this.props.score > 0 && getRoyales().length >= 10) {
            requestReview()
        }
    }

    private shareStats() {
        const won = this.props.position === 0

        if (navigator && "share" in navigator) {
            const n = navigator as any
            const lossMessage = `I managed to get past ${this.props.score} pipes on Flappy Royale`
            const winMessage = `I won on Flappy Royale!`

            n.share({
                title: "Flappy Royale",
                text: won ? winMessage : lossMessage,
                url: "https://flappyroyale.io"
            })
        }
    }

    private backToMainMenu() {
        this.game.scene.remove(this)
        this.game.scene.remove(this.props.battle)

        launchMainMenu(this.game)
    }

    private async goToRoyaleLobby() {
        this.game.scene.remove(this)
        this.game.scene.remove(this.props.battle)

        const seeds = await getSeedsFromAPI(APIVersion)
        const index = getAndBumpUserCycleSeedIndex(seeds.royale.length)
        const seed = seeds.royale[index]
        const lobby = new RoyaleLobby({ seed })
        this.game.scene.add("RoyaleLobby" + seed, lobby, true, {})
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
