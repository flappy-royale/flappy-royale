import * as Phaser from "phaser"
import { GameWidth, GameHeight } from "../constants"
import { launchMainMenu } from "./MainMenuScene"
import { preloadBackgroundBlobImages, setupBackgroundBlobImages } from "./utils/backgroundColors"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"
import { saveSettings, getSettings, GameQuality, DarkMode } from "../gameSettings"
import { launchTutorial } from "../battle/TutorialScene"
import _ = require("lodash")
import { openURL } from "../nativeComms/openURL"
import { Prompt, showPrompt } from "./Prompt"
import { getUserSettings } from "../user/userManager"
import { EnterNameScreen, NamePromptKey } from "./EnterNameScreen"
import { addScene } from "./utils/addScene"
import { BackgroundScene, showBackgroundScene } from "./BackgroundScene"

export const AppSettingsKey = "UserSettings"

interface ButtonState<T> {
    value: T
    bgImage: string
    text: string
}

const BooleanStates = [
    {
        value: true,
        text: "on",
        bgImage: require("../../assets/menu/SettingsButton-Green.png")
    },
    {
        value: false,
        text: "off",
        bgImage: require("../../assets/menu/SettingsButton-Red.png")
    }
]

interface EnumButtonOptions<T> {
    initialValue: T
    disabled?: boolean
    states: ButtonState<T>[]
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

        this.load.image("button-bg-on", require("../../assets/menu/SettingsButton-Green.png"))
        this.load.image("button-bg-off", require("../../assets/menu/SettingsButton-Red.png"))
        this.load.image("button-bg-purple", require("../../assets/menu/SettingsButton-Purple.png"))

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

        // Handle name changes
        setupName(this)

        const settings = getSettings()
        console.log(settings)

        this.makeButton("audio-button", { initialValue: settings.sound, states: BooleanStates }, sound =>
            saveSettings({ sound })
        )
        this.makeButton("haptics-button", { initialValue: settings.haptics, states: BooleanStates }, haptics =>
            saveSettings({ haptics })
        )
        this.makeButton<GameQuality>(
            "quality-button",
            {
                initialValue: settings.quality,
                states: [
                    {
                        value: GameQuality.Auto,
                        text: "auto",
                        bgImage: require("../../assets/menu/SettingsButton-Purple.png")
                    },
                    {
                        value: GameQuality.Low,
                        text: "low",
                        bgImage: require("../../assets/menu/SettingsButton-Red.png")
                    },
                    {
                        value: GameQuality.High,
                        text: "high",
                        bgImage: require("../../assets/menu/SettingsButton-Green.png")
                    }
                ]
            },
            quality => {
                saveSettings({ quality })
            }
        )

        this.makeButton<DarkMode>(
            "dark-mode-button",
            {
                initialValue: settings.darkMode,
                states: [
                    {
                        value: DarkMode.Auto,
                        text: "auto",
                        bgImage: require("../../assets/menu/SettingsButton-Purple.png")
                    },
                    {
                        value: DarkMode.Off,
                        text: "off",
                        bgImage: require("../../assets/menu/SettingsButton-Red.png")
                    },
                    {
                        value: DarkMode.On,
                        text: "on",
                        bgImage: require("../../assets/menu/SettingsButton-Green.png")
                    }
                ]
            },
            darkMode => {
                saveSettings({ darkMode })
            }
        )

        document.getElementById("reset")!.addEventListener("click", () => {
            this.game.scene.remove(this)
            const bgScene = showBackgroundScene(this.game)

            const options = {
                title: "Are you sure? This",
                subtitle: "will erase everything.",
                yes: "yes",
                no: "no",

                completion: (response: boolean, prompt: Prompt) => {
                    if (response) {
                        const reviews = localStorage.getItem("reviews")
                        const lives = localStorage.getItem("lives-state")

                        localStorage.clear()

                        if (reviews) localStorage.setItem("reviews", reviews)
                        if (lives) localStorage.setItem("lives-state", lives)

                        window.location.reload()
                    } else {
                        prompt.dismiss()
                        bgScene.dismiss()
                        const settings = new AppSettingsScene()
                        addScene(this.game, AppSettingsKey, settings, true)
                    }
                }
            }
            showPrompt(options, this.game)
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

        const metaSha = document.getElementById("meta-sha")!
        const sha = metaSha.getElementsByTagName("span")[0].textContent
        metaSha.onclick = () => {
            openURL(`https://github.com/flappy-royale/flappy-royale/commit/${sha}`)
        }

        back.onclick = () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }
    }

    setButtonState<T>(el: HTMLButtonElement, state: ButtonState<T>) {
        el.innerText = state.text
        el.style.backgroundImage = `url(${state.bgImage})`
    }

    setButtonEnabled(el: HTMLButtonElement, enabled: boolean) {
        el.disabled = !enabled
        el.style.opacity = enabled ? "1" : "0.3"
    }

    makeButton<T>(id: string, opts: EnumButtonOptions<T>, onChange: (newValue: T) => void) {
        let currentValue = opts.initialValue
        const el = document.getElementById(id) as HTMLButtonElement

        let currentState = opts.states.find(s => s.value === currentValue)
        let currentIndex = _.indexOf(opts.states, currentState)

        if (!currentState) return
        this.setButtonState(el, currentState)

        el.addEventListener("click", () => {
            currentIndex += 1
            if (currentIndex >= opts.states.length) {
                currentIndex = 0
            }

            currentState = opts.states[currentIndex]
            this.setButtonState(el, currentState)
            onChange(currentState.value)
        })
    }
}
function setupName(settings: AppSettingsScene) {
    const userSettings = getUserSettings()
    const nameDiv = document.getElementById("name")!

    const buttonBG = document.getElementById("button-bg") as HTMLImageElement
    buttonBG.src = require("../../assets/menu/ButtonBG.png")

    nameDiv.innerText = userSettings.name
    document.getElementById("change-name")!.addEventListener("click", () => {
        const namePrompt = new EnterNameScreen(true, (name?: string) => {
            settings.scene.remove(namePrompt)
            if (name) {
                nameDiv.innerText = name
            }
        })
        addScene(settings.game, NamePromptKey, namePrompt, true)
    })
}
