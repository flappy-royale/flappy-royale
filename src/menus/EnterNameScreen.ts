import * as Phaser from "phaser"
import _ = require("lodash")
import { changeSettings } from "../user/userManager"
import { usernameIsValid } from "../usernameIsValid"
import { analyticsSetID } from "../nativeComms/analytics"
import * as PlayFab from "../playFab"

export const NamePromptKey = "EnterName"

export class EnterNameScreen extends Phaser.Scene {
    completion: (name?: string) => void
    showCancelButton: boolean

    constructor(showCancelButton: boolean, completion: (name: string | undefined) => void) {
        super(NamePromptKey)
        this.completion = completion
        this.showCancelButton = showCancelButton
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
        const yellowButton = require("../../assets/menu/ButtonSmallBG-Yellow.png")
        const disabledButton = require("../../assets/menu/ButtonSmallBG-Disabled.png")

        const buttonBG = document.getElementById("ok-button-bg") as HTMLImageElement
        buttonBG.src = disabledButton
        const okButtonBG = this.showCancelButton ? yellowButton : normalButton

        const cancelButtonBG = document.getElementById("cancel-button-bg") as HTMLImageElement
        cancelButtonBG.src = normalButton

        const usernameInput = document.getElementById("username") as HTMLInputElement
        const button = document.getElementById("ok-button") as HTMLButtonElement
        button.disabled = true

        const cancelButton = document.getElementById("cancel-button") as HTMLButtonElement
        const loader = document.getElementById("loader") as HTMLElement
        const ok = document.getElementById("ok") as HTMLElement
        const errMessage = document.getElementById("error") as HTMLElement

        if (!this.showCancelButton) {
            cancelButton.classList.add("hidden")
        }

        const inputIsBad = (errorMsg?: { error: string; errorMessage: string }) => {
            usernameInput.style.border = "2px #F6595F solid"
            if (errorMsg) {
                if (errorMsg.error === "ProfaneDisplayName") {
                    errMessage.textContent = "Name is not cool"
                } else {
                    errMessage.textContent = errorMsg.errorMessage
                }
            }
            button.disabled = true
            buttonBG.src = disabledButton
        }

        const inputIsGood = () => {
            usernameInput.style.border = "none"
            button.disabled = false
            buttonBG.src = okButtonBG
        }

        const validateName = () => {
            const name = usernameInput.value

            if (usernameIsValid(name)) {
                inputIsGood()
            } else {
                inputIsBad()
            }
        }

        document.addEventListener("keyup", validateName)

        document.getElementById("username")!.focus()

        cancelButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
            this.completion(undefined)
        })

        button.addEventListener("click", async () => {
            const nameToTry = usernameInput.value

            // It's quicker to run local rules than hit PlayFab, so we might as well
            if (!usernameIsValid(nameToTry)) {
                inputIsBad()
                return
            }

            loader.style.display = "inline-block"
            ok.textContent = ""
            const result = await PlayFab.updateName(nameToTry).catch(inputIsBad)
            loader.style.display = "none"
            ok.textContent = "Ok"

            if (!result) {
                usernameInput.focus()
                return
            }

            if (result.code !== 200) {
                inputIsBad()
                usernameInput.focus()
            }

            const name = result.data.DisplayName
            if (!name) {
                usernameInput.focus()
                return
            }

            // We have code in place to fix scroll placement on blur,
            // but manually triggering window.blur() or usernameInput.blur() doesn't fire it
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" })

            changeSettings({ name })
            analyticsSetID(name)

            this.completion(name)
        })
    }
}
