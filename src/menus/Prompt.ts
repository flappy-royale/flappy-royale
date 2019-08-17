import * as Phaser from "phaser"
import _ = require("lodash")
import { GameWidth, GameHeight, zLevels } from "../constants"
import { becomeButton } from "./utils/becomeButton"
import { centerAlignTextLabel } from "../battle/utils/alignTextLabel"
import { addScene } from "./utils/addScene"

export const PromptKey = "Prompt"

export interface PromptOptions {
    title?: string
    subtitle?: string

    yes?: string
    no?: string

    /** If true, we draw a black background that the user also can't tap over */
    drawBgLayer?: boolean
    y?: number

    zDepth?: number
    zDepthBg?: number

    completion?: (response: boolean, prompt: Prompt) => void
}

export interface HtmlPromptOptions extends PromptOptions {
    completion?: (response: boolean) => void
}

const defaultOptions = (): PromptOptions => {
    return {
        drawBgLayer: true,
        y: (2 / 5) * GameHeight
    }
}

/** Normal `Prompt` objects are Phaser scenes.
 * We can't overlay those on top of HTML forms, so this is a simple HTML representation
 * for when we need to show these on HTML pages.
 *
 * It auto-injects the element into the DOM.
 * Unlike normal prompts, it'll auto-dismiss itself after the user taps a button.
 *
 * In an ideal world, this would use the Phaser HTML from functionality we're already using.
 * In practice, figuring out how to create a second DOM element was being fiddly.
 * As long as this is only called if a DOM form already exists, we can make assumptions and just do manual DOM manipulation.
 */
export function showHtmlPrompt(options: HtmlPromptOptions, scene: Phaser.Scene) {
    const prompt = document.createElement("div")
    prompt.id = "prompt"

    const opts = { ...defaultOptions(), ...options } as HtmlPromptOptions
    prompt.style.top = `${opts.y!}px`

    const screen = document.getElementsByClassName("screen")[0]
    if (!screen) {
        console.log("No screen found!")
        return
    }

    let bgLayer: HTMLDivElement | undefined
    if (opts.drawBgLayer) {
        bgLayer = document.createElement("div")
        bgLayer.id = "prompt-shade"
        screen.appendChild(bgLayer)
    }

    if (opts.title) {
        const title = document.createElement("div")
        title.innerText = opts.title
        title.className = "title"
        prompt.appendChild(title)
    }

    if (opts.subtitle) {
        const subtitle = document.createElement("div")
        subtitle.innerText = opts.subtitle
        subtitle.className = "subtitle"
        prompt.appendChild(subtitle)
    }

    if (opts.no) {
        const no = document.createElement("div")
        no.innerText = opts.no
        no.id = "no-button"
        no.style.backgroundImage = `url(${require("../../assets/menu/ButtonSmallBG.png")})`

        if (opts.yes) {
            no.style.left = "30%"
        } else {
            no.style.left = "50%"
        }

        no.addEventListener("click", () => {
            screen.removeChild(prompt)
            if (bgLayer) {
                screen.removeChild(bgLayer)
            }

            if (opts.completion) {
                opts.completion(false)
            }
        })

        prompt.appendChild(no)
    }

    if (opts.yes) {
        const yes = document.createElement("div")
        yes.innerText = opts.yes
        yes.id = "yes-button"
        yes.style.backgroundImage = `url(${require("../../assets/menu/ButtonSmallBG-Yellow.png")})`

        if (options.no) {
            yes.style.left = "80%"
        } else {
            yes.style.left = "50%"
        }

        yes.addEventListener("click", () => {
            screen.removeChild(prompt)
            if (bgLayer) {
                screen.removeChild(bgLayer)
            }

            if (opts.completion) {
                opts.completion(true)
            }
        })

        prompt.appendChild(yes)
    }

    screen.appendChild(prompt)
}

/** Pass in a Game if you want this to be its own scene.
 * Pass in a Scene if you just want these added to an existing scene
 */
export function showPrompt(options: PromptOptions, game: Phaser.Game): Prompt {
    const opts = { ...defaultOptions(), ...options }
    const prompt = new Prompt(opts)
    addScene(game, PromptKey, prompt, true)
    return prompt
}

export class Prompt extends Phaser.Scene {
    options: PromptOptions

    parent?: Phaser.Scene
    objectList?: Phaser.GameObjects.GameObject

    key: string

    constructor(opts: PromptOptions) {
        super(PromptKey)

        this.key = PromptKey

        this.options = opts
    }

    preload() {
        this.load.image("attire-button-small-bg", require("../../assets/menu/ButtonSmallBG.png"))
        this.load.image("attire-button-small-bg-light", require("../../assets/menu/ButtonSmallBG-Light.png"))
        this.load.image("attire-button-small-bg-yellow", require("../../assets/menu/ButtonSmallBG-Yellow.png"))
        this.load.bitmapFont("fipps", require("../../assets/fonts/fipps.png"), require("../../assets/fonts/fipps.fnt"))
    }

    create() {
        const depth = this.options.zDepth || zLevels.ui
        const bgDepth = this.options.zDepthBg || zLevels.uiBg

        if (this.options.drawBgLayer) {
            const bg = this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0x000000, 0.4)
            bg.setDepth(bgDepth)
            bg.setInteractive()
        }

        let y = this.options.y!

        if (this.options.title) {
            const title = this.add.bitmapText(0, y, "fipps", this.options.title, 8)
            centerAlignTextLabel(title)
            title.setDepth(depth)
            y += title.getTextBounds(true).local.height
        }

        if (this.options.subtitle) {
            const subtitle = this.add.bitmapText(0, y, "fipps", this.options.subtitle, 8)
            centerAlignTextLabel(subtitle)
            subtitle.setDepth(depth)

            y += subtitle.getTextBounds(true).local.height
        }

        if (this.options.no || this.options.yes) {
            y += 20
        }

        if (this.options.no && this.options.yes) {
            const noBg = this.add.image(Math.round(GameWidth / 3), y, "attire-button-small-bg")
            noBg.setDepth(depth)
            const noText = this.add.bitmapText(noBg.x - 20, noBg.y - 5, "fipps", this.options.no, 8)
            noText.setDepth(depth)
            becomeButton(noBg, this.no, this, [noText])

            const yesBg = this.add.image(Math.round((4 * GameWidth) / 5), y, "attire-button-small-bg-yellow")
            yesBg.setDepth(depth)
            yesBg.x = GameWidth - yesBg.width
            const yesText = this.add.bitmapText(yesBg.x - 20, yesBg.y - 5, "fipps", this.options.yes, 8)
            becomeButton(yesBg, this.yes, this, [yesText])
            yesText.setDepth(depth)

            y += yesBg.height
        } else if (this.options.no) {
            const noBg = this.add.image(GameWidth / 2, y, "attire-button-small-bg")
            noBg.setDepth(depth)

            const noText = this.add.bitmapText(0, noBg.y - 5, "fipps", this.options.no, 8)
            centerAlignTextLabel(noText)
            noText.setDepth(depth)

            becomeButton(noBg, this.no, this, [noText])

            y += noBg.height
        } else if (this.options.yes) {
            const yesBg = this.add.image(GameWidth / 2, y, "attire-button-small-bg-yellow")
            yesBg.setDepth(depth)

            const yesText = this.add.bitmapText(yesBg.x - 20, yesBg.y - 5, "fipps", this.options.yes, 8)
            becomeButton(yesBg, this.yes, this, [yesText])
            yesText.setDepth(depth)

            y += yesBg.height
        }

        y += 10

        const height = y - this.options.y!
        const bgY = this.options.y! - 10 + height / 2

        const bg = this.add.rectangle(GameWidth / 2, bgY, GameWidth, height, 0x8991eb)
        bg.setDepth(bgDepth)
    }

    private yes() {
        if (this.options.completion) {
            this.options.completion(true, this)
        }
    }

    dismiss() {
        this.scene.remove(this.key)
    }

    private no() {
        if (this.options.completion) {
            this.options.completion(false, this)
        }
    }
}
