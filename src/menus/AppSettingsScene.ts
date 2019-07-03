import * as Phaser from "phaser"
import { GameWidth, GameHeight } from "../constants"
import { launchMainMenu } from "./MainMenuScene"
import { preloadBackgroundBlobImages, setupBackgroundBlobImages } from "./utils/backgroundColors"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"

export const AppSettingsKey = "UserSettings"

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

        document.getElementById("button")!.addEventListener("click", () => {
            if (confirm("Are you sure you want to erase all your progress? This cannot be undone.")) {
                localStorage.clear()
                window.location.reload()
            }
        })

        const header = document.getElementById("header") as HTMLImageElement
        header.src = require("../../assets/menu/RedSash.png")
        const footer = document.getElementById("footer") as HTMLImageElement
        footer.src = require("../../assets/menu/BottomSash.png")

        const back = document.getElementById("back") as HTMLImageElement
        back.src = require("../../assets/menu/Back2.png")

        back.onclick = () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }
    }
}
