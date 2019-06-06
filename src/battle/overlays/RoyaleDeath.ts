import { GameWidth, GameHeight } from "../../constants"
import * as Phaser from "phaser"
import { launchMainMenu } from "../../menus/MainMenuScene"
import { getNumberWithOrdinal } from "../Scene"

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
    game.load.image("button-bg", "../../../assets/menu/ButtonBG.png")
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
        back.setInteractive()
        back.on("pointerdown", () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        })

        const share = this.add.image(100, GameHeight - 18, "button-bg")
        share.setInteractive()
        share.on("pointerdown", () => {
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
        })

        this.add.bitmapText(62, GameHeight - 31, "fipps-bit", "SHARE", 16)
    }
}
