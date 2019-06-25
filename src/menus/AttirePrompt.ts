import * as Phaser from "phaser"
import _ = require("lodash")
import { GameWidth, GameHeight, zLevels } from "../constants"
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
        this.load.image("attire-button-small-bg-yellow", require("../../assets/menu/ButtonSmallBG-Yellow.png"))
        this.load.bitmapFont("fipps", require("../../assets/fonts/fipps.png"), require("../../assets/fonts/fipps.fnt"))
    }

    create() {
        const title = this.add.bitmapText(0, (2 / 5) * GameHeight, "fipps", "Flap in fashion!", 12)
        const subtitle = this.add.bitmapText(0, title.y + 24, "fipps", "Customize your bird?", 8)

        centerAlignTextLabel(title)
        centerAlignTextLabel(subtitle)

        title.setDepth(zLevels.ui)
        subtitle.setDepth(zLevels.ui)

        const noBg = this.add.image(GameWidth / 3, subtitle.y + 40, "attire-button-small-bg")
        noBg.setDepth(zLevels.ui)
        const noText = this.add.bitmapText(noBg.x - 20, noBg.y - 5, "fipps", "LATER", 8)
        noText.setDepth(zLevels.ui)
        becomeButton(noBg, this.no, this, [noText])

        const yesBg = this.add.image((4 * GameWidth) / 5, subtitle.y + 40, "attire-button-small-bg-yellow")
        yesBg.setDepth(zLevels.ui)
        yesBg.x = GameWidth - yesBg.width
        const yesText = this.add.bitmapText(yesBg.x - 20, yesBg.y - 5, "fipps", "YEAH!", 8)
        becomeButton(yesBg, this.yes, this, [yesText])
        yesText.setDepth(zLevels.ui)

        const height = yesBg.y + yesBg.height - title.y + 10
        const y = title.y - 10 + height / 2
        const bg = this.add.rectangle(GameWidth / 2, y, GameWidth, height, 0x8991eb)
        bg.setDepth(zLevels.uiBg)
    }

    private yes() {
        this.completion(true)
    }

    private no() {
        this.completion(false)
    }
}
