import { APIVersion, GameWidth, GameHeight } from "../../constants"
import * as Phaser from "phaser"
import { launchMainMenu } from "../../menus/MainMenuScene"
import { getNumberWithOrdinal } from "../Scene"
import { becomeButton } from "../../menus/utils/becomeButton"
import { getSeedsFromAPI } from "../../firebase"
import { getAndBumpUserCycleSeedIndex } from "../../user/userManager"
import { RoyaleLobby } from "../../menus/RoyaleLobby"

export interface RoyaleDeathProps {
    score: number
    position: number
}

export const deathPreload = (game: Phaser.Scene) => {
    game.load.image("green-sash", "../../../assets/menu/GreenSash.png")
    game.load.image("red-sash", "../../../assets/menu/RedSash.png")
    game.load.image("green-sash-small", "../../../assets/menu/GreenSashSmall.png")
    game.load.image("footer-bg", "../../../assets/menu/BottomSash.png")
    game.load.image("back", "../../../assets/menu/Back2.png")
    game.load.image("button-bg", "../../../assets/menu/ButtonSmallBG.png")
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

        if (!won) {
            this.add.image(60, 152, "green-sash-small")
            this.add.bitmapText(10, 148, "fipps-bit", `${getNumberWithOrdinal(this.props.position)} place`, 8)
        }

        this.add.image(80, GameHeight - 8, "footer-bg")
        const back = this.add.image(16, GameHeight - 20, "back")
        becomeButton(back, this.backToMainMenu, this)

        const newGame = this.add.image(60, GameHeight - 20, "button-bg")
        const newGameText = this.add.bitmapText(41, GameHeight - 27, "fipps-bit", "AGAIN", 8)
        becomeButton(newGame, this.goToRoyaleLobby, this, [newGameText])

        const share = this.add.image(120, GameHeight - 20, "button-bg")
        const shareText = this.add.bitmapText(100, GameHeight - 27, "fipps-bit", "SHARE", 8)
        becomeButton(share, this.shareStats, this, [shareText])
    }

    private shareStats(won: boolean) {
        if (navigator && "share" in navigator) {
            const n = navigator as any
            const lossMessage = `I managed to get past ${this.props.score} pipes on Flappy Royale`
            const winMessaage = `I won on Flappy Royale!`
            n.share({
                title: "Flappy Royale",
                text: won ? winMessaage : lossMessage,
                url: "https://flappyroyale.io"
            })
        }
    }

    private backToMainMenu() {
        this.game.scene.remove(this)
        launchMainMenu(this.game)
    }

    private async goToRoyaleLobby() {
        this.game.scene.remove(this)

        const seeds = await getSeedsFromAPI(APIVersion)
        const index = getAndBumpUserCycleSeedIndex(seeds.royale.length)
        const seed = seeds.royale[index]
        const lobby = new RoyaleLobby({ seed })
        this.game.scene.add("RoyaleLobby" + seed, lobby, true, {})
    }
}
