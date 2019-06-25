import * as Phaser from "phaser"
import _ = require("lodash")
import { GameWidth, GameHeight } from "../constants"
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

        document.getElementById("button").addEventListener("click", () => {
            const usernameInput = document.getElementById("username") as HTMLInputElement

            changeSettings({ name: usernameInput.value })
            this.completion()
        })
    }
}
