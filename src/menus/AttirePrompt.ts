import * as Phaser from "phaser"
import _ = require("lodash")
import { GameWidth, GameHeight } from "../constants"
import { changeSettings } from "../user/userManager"
import { becomeButton } from "./utils/becomeButton"
import { rightAlignTextLabel, centerAlignTextLabel } from "../battle/utils/alignTextLabel"

export const AttirePromptKey = "AttirePrompt"

export class AttirePrompt extends Phaser.Scene {
    completion: (response: boolean) => void

    constructor(completion: (response: boolean) => void) {
        super(AttirePromptKey)
        this.completion = completion
    }

    preload() {
        this.load.image("attire-button-small-bg", require("../../assets/menu/ButtonSmallBG.png"))
        this.load.image("attire-button-small-bg-light", require("../../assets/menu/ButtonSmallBG-Light.png"))
        this.load.bitmapFont("fipps", require("../../assets/fonts/fipps.png"), require("../../assets/fonts/fipps.fnt"))
    }

    create() {
        const title = this.add.bitmapText(0, (2 / 5) * GameHeight, "fipps", "Flap in fashion!", 12)
        const subtitle = this.add.bitmapText(0, title.y + 24, "fipps", "Customize your bird?", 8)

        centerAlignTextLabel(title)
        centerAlignTextLabel(subtitle)

        const noBg = this.add.image(GameWidth / 3, subtitle.y + 40, "attire-button-small-bg")
        const noText = this.add.bitmapText(noBg.x - 20, noBg.y - 5, "fipps", "LATER", 8)
        becomeButton(noBg, this.no, this, [noText])

        const yesBg = this.add.image((4 * GameWidth) / 5, subtitle.y + 40, "attire-button-small-bg-light")
        yesBg.x = GameWidth - yesBg.width
        const yesText = this.add.bitmapText(yesBg.x - 20, yesBg.y - 5, "fipps", "YEAH!", 8)
        becomeButton(yesBg, this.yes, this, [yesText])
    }

    private yes() {
        this.completion(true)
    }

    private no() {
        this.completion(false)
    }
}
