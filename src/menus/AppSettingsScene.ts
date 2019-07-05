import * as Phaser from "phaser"
import { GameWidth, GameHeight } from "../constants"
import { launchMainMenu } from "./MainMenuScene"
import { preloadBackgroundBlobImages, setupBackgroundBlobImages } from "./utils/backgroundColors"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"
import { saveSettings, getSettings } from "../gameSettings"
import { launchTutorial } from "../battle/TutorialScene"

export const AppSettingsKey = "UserSettings"

interface ButtonOptions {
    initialValue: boolean
    disabled?: boolean

    onText?: string
    offText?: string
}

export class AppSettingsScene extends Phaser.Scene {
    constructor() {
        super(AppSettingsKey)
    }

    preload() {
        // Adds the HTML file to the game cache
        this.load.html("Settings", require("../../assets/html/Settings.html"))
        this.load.image("back-button", require("../../assets/menu/Back2.png"))
        this.load.image("bottom-sash", require("../../assets/menu/BottomSash.png"))
        this.load.image("white-circle", require("../../assets/menu/Circle.png"))
        this.load.image("attire-empty", require("../../assets/menu/AttireSelectionEmpty.png"))
        this.load.image("attire-selected", require("../../assets/menu/AttireSelected.png"))

        this.load.image("button-bg-on", require("../../assets/menu/ButtonSmallBG-Green.png"))
        this.load.image("button-bg-off", require("../../assets/menu/ButtonSmallBG-Red.png"))

        preloadBackgroundBlobImages(this)
    }

    create() {
        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0xdecf5e)

        setupBackgroundBlobImages(this, { min: 30 })

        // Make a HTML form
        var element = this.add
            .dom(0, 0)
            .setOrigin(0, 0)
            .createFromCache("Settings")
        resizeToFullScreen(element)
        element.addListener("click")

        const settings = getSettings()
        this.makeButton("audio-button", { initialValue: settings.sound }, sound => saveSettings({ sound }))
        this.makeButton("haptics-button", { initialValue: settings.haptics }, haptics => saveSettings({ haptics }))
        this.makeButton(
            "quality-button",
            {
                initialValue: !settings.lowPerformanceMode,
                onText: "high",
                offText: "low"
            },
            value => {
                saveSettings({ lowPerformanceMode: !value })
            }
        )
        // this.makeButton("dark-mode-button", settings.darkMode, darkMode => saveSettings({ darkMode }))

        // this.makeButton("auto-dark-mode-button", settings.autoDarkMode, autoDarkMode => {
        //     const otherButton = document.getElementById("dark-mode-button")! as HTMLButtonElement
        //     this.setButtonState(otherButton, getSettings().darkMode, autoDarkMode)
        //     saveSettings({ autoDarkMode })
        // })

        // // Set initial dark mode disabled state
        // const otherButton = document.getElementById("dark-mode-button")! as HTMLButtonElement
        // this.setButtonState(otherButton, settings.darkMode, settings.autoDarkMode)

        document.getElementById("reset")!.addEventListener("click", () => {
            if (confirm("Are you sure you want to erase all your progress? This cannot be undone.")) {
                localStorage.clear()
                window.location.reload()
            }
        })

        document.getElementById("show-tutorial")!.addEventListener("click", () => {
            this.game.scene.remove(this)
            launchTutorial(this.game)
        })

        const header = document.getElementById("header") as HTMLImageElement
        header.src = require("../../assets/menu/RedSash.png")
        const footer = document.getElementById("footer") as HTMLImageElement
        footer.src = require("../../assets/menu/BottomSash.png")

        const back = document.getElementById("back") as HTMLImageElement
        back.src = require("../../assets/menu/Back2.png")

        // Show or hide the build metadata in the game
        const metaApp = document.getElementById("meta-app")!
        if (window.appVersion) {
            metaApp.getElementsByTagName("span")[0].textContent = window.appVersion
        } else {
            metaApp.parentNode!.removeChild(metaApp)
        }

        const metaBuild = document.getElementById("meta-build")!
        if (window.buildVersion) {
            metaBuild.getElementsByTagName("span")[0].textContent = window.buildVersion
        } else {
            metaBuild.parentNode!.removeChild(metaBuild)
        }

        back.onclick = () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }
    }

    setButtonState(el: HTMLButtonElement, value: boolean, opts: ButtonOptions) {
        const text = value ? opts.onText || "on" : opts.offText || "off"
        let bgImage

        if (opts.disabled) {
            bgImage = require("../../assets/menu/ButtonSmallBG-Disabled.png")
        } else if (value) {
            bgImage = require("../../assets/menu/ButtonSmallBG-Green.png")
        } else {
            bgImage = require("../../assets/menu/ButtonSmallBG-Red.png")
        }

        el.disabled = opts.disabled || false
        el.innerText = text
        el.style.backgroundImage = `url(${bgImage})`
    }

    makeButton(id: string, opts: ButtonOptions, onChange: (newValue: boolean) => void) {
        let currentValue = opts.initialValue
        const el = document.getElementById(id) as HTMLButtonElement
        this.setButtonState(el, currentValue, opts)

        el.addEventListener("click", () => {
            currentValue = !currentValue
            this.setButtonState(el, currentValue, opts)
            onChange(currentValue)
        })
    }
}
