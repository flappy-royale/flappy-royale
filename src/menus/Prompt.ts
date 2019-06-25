import * as Phaser from "phaser"
import _ = require("lodash")
import { GameWidth, GameHeight, zLevels } from "../constants"
import { becomeButton } from "./utils/becomeButton"
import { centerAlignTextLabel } from "../battle/utils/alignTextLabel"
import { addScene } from "./utils/addScene"

export const PromptKey = "AttirePrompt"

export interface PromptOptions {
    title: string
    subtitle?: string

    yes?: string
    no?: string
    completion: (response: boolean, prompt: Prompt) => void
}

export function showPrompt(options: PromptOptions, game: Phaser.Game) {
    const prompt = new Prompt(options)
    addScene(game, PromptKey, prompt, true)
}

export class Prompt extends Phaser.Scene {
    options: PromptOptions

    constructor(opts: PromptOptions) {
        super(PromptKey)

        this.options = opts
    }

    preload() {
        this.load.image("attire-button-small-bg", require("../../assets/menu/ButtonSmallBG.png"))
        this.load.image("attire-button-small-bg-light", require("../../assets/menu/ButtonSmallBG-Light.png"))
        this.load.image("attire-button-small-bg-yellow", require("../../assets/menu/ButtonSmallBG-Yellow.png"))
        this.load.bitmapFont("fipps", require("../../assets/fonts/fipps.png"), require("../../assets/fonts/fipps.fnt"))
    }

    create() {
        let y = (2 / 5) * GameHeight

        const title = this.add.bitmapText(0, y, "fipps", this.options.title, 12)
        centerAlignTextLabel(title)
        title.setDepth(zLevels.ui)

        y += title.getTextBounds(true).local.height

        if (this.options.subtitle) {
            const subtitle = this.add.bitmapText(0, title.y + 24, "fipps", this.options.subtitle, 8)
            centerAlignTextLabel(subtitle)
            subtitle.setDepth(zLevels.ui)

            y += subtitle.getTextBounds(true).local.height
        }

        if (this.options.no || this.options.yes) {
            y += 20
        }

        if (this.options.no && this.options.yes) {
            const noBg = this.add.image(GameWidth / 3, y, "attire-button-small-bg")
            noBg.setDepth(zLevels.ui)
            const noText = this.add.bitmapText(noBg.x - 20, noBg.y - 5, "fipps", "LATER", 8)
            noText.setDepth(zLevels.ui)
            becomeButton(noBg, this.no, this, [noText])

            const yesBg = this.add.image((4 * GameWidth) / 5, y, "attire-button-small-bg-yellow")
            yesBg.setDepth(zLevels.ui)
            yesBg.x = GameWidth - yesBg.width
            const yesText = this.add.bitmapText(yesBg.x - 20, yesBg.y - 5, "fipps", "YEAH!", 8)
            becomeButton(yesBg, this.yes, this, [yesText])
            yesText.setDepth(zLevels.ui)

            y += yesBg.height
        } else if (this.options.no) {
            const noBg = this.add.image(GameWidth / 2, y, "attire-button-small-bg")
            noBg.setDepth(zLevels.ui)

            const noText = this.add.bitmapText(0, noBg.y - 5, "fipps", "LATER", 8)
            centerAlignTextLabel(noText)
            noText.setDepth(zLevels.ui)

            becomeButton(noBg, this.no, this, [noText])

            y += noBg.height
        } else if (this.options.yes) {
            const yesBg = this.add.image(GameWidth / 2, y, "attire-button-small-bg-yellow")
            yesBg.setDepth(zLevels.ui)

            const yesText = this.add.bitmapText(yesBg.x - 20, yesBg.y - 5, "fipps", "YEAH!", 8)
            becomeButton(yesBg, this.yes, this, [yesText])
            yesText.setDepth(zLevels.ui)

            y += yesBg.height
        }

        y += 10

        const height = y - title.y
        const bgY = title.y - 10 + height / 2

        const bg = this.add.rectangle(GameWidth / 2, bgY, GameWidth, height, 0x8991eb)
        bg.setDepth(zLevels.uiBg)
    }

    private yes() {
        this.options.completion(true, this)
    }

    private no() {
        this.options.completion(false, this)
    }
}
