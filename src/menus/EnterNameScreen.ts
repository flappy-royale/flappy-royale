import * as Phaser from "phaser"
import _ = require("lodash")
import { changeSettings } from "../user/userManager"
import { usernameIsValid } from "../usernameIsValid"
import { analyticsSetID } from "../nativeComms/analytics"

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

        const normalButton = require("../../assets/menu/ButtonSmallBG.png")
        const disabledButton = require("../../assets/menu/ButtonSmallBG-Disabled.png")

        const buttonBG = document.getElementById("button-bg") as HTMLImageElement
        buttonBG.src = disabledButton

        const usernameInput = document.getElementById("username") as HTMLInputElement
        const button = document.getElementById("button") as HTMLButtonElement
        button.disabled = true

        const validateName = () => {
            const name = usernameInput.value

            if (usernameIsValid(name)) {
                usernameInput.style.border = "none"
                button.disabled = false
                buttonBG.src = normalButton
            } else {
                usernameInput.style.border = "2px red solid"
                button.disabled = true
                buttonBG.src = disabledButton
            }
        }

        document.addEventListener("keyup", validateName)

        document.getElementById("username")!.focus()
        button.addEventListener("click", () => {
            const name = usernameInput.value
            if (!usernameIsValid(name)) {
                return
            }

            // We have code in place to fix scroll placement on blur,
            // but manually triggering window.blur() or usernameInput.blur() doesn't fire it
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" })

            changeSettings({ name })
            analyticsSetID(name)

            this.completion()
        })
    }
}
