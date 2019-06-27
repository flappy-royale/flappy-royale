import * as Phaser from "phaser"
import _ = require("lodash")
import { changeSettings } from "../user/userManager"

export const NamePromptKey = "EnterName"

export class EnterNameScreen extends Phaser.Scene {
    completion: () => void

    constructor(completion: () => void) {
        super(NamePromptKey)
        this.completion = completion
    }

    preload() {
        this.load.html("NameForm", require("../../assets/html/NameForm.html"))
    }

    create() {
        // Make a HTML form
        const el = this.add
            .dom(0, 0)
            .setOrigin(0, 0)
            .createFromCache("NameForm")

        const buttonBG = document.getElementById("button-bg") as HTMLImageElement
        buttonBG.src = require("../../assets/menu/ButtonSmallBG.png")

        document.getElementById("username").focus()
        document.getElementById("button").addEventListener("click", () => {
            const usernameInput = document.getElementById("username") as HTMLInputElement

            // We have code in place to fix scroll placement on blur,
            // but manually triggering window.blur() or usernameInput.blur() doesn't fire it
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" })

            changeSettings({ name: usernameInput.value })
            this.completion()
        })
    }
}
