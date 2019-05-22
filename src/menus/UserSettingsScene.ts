import * as Phaser from "phaser"
import { getUserSettings, changeSettings } from "../user/userManager"
import { GameWidth, GameHeight } from "../constants"

export const UserSettingsKey = "UserSettings"

export class UserSettings extends Phaser.Scene {
    constructor() {
        super(UserSettingsKey)
    }

    preload() {
        // Adds the HTML file to the game cache
        this.load.html("nameform", require("../../assets/html/user-form.html"))
        this.load.image("back-button", require("../../assets/menu/back.png"))
    }

    create() {
        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0xff0000)

        // Make a HTML form
        var element = this.add.dom(75, 90).createFromCache("nameform")
        console.log(element)
        element.addListener("click")

        // Grab the username via the DOM API
        const usernameInput = element.node.getElementsByTagName("input").item(0)
        const settings = getUserSettings()
        usernameInput.value = settings.name

        element.on("click", function(event) {
            if (event.target.name === "loginButton") {
                const usernameInput = element.node.getElementsByTagName("input").item(0)
                changeSettings({ name: usernameInput.value })
                this.removeListener("click")
            }
        })

        this.add
            .image(80, 200, "back-button")
            .setInteractive()
            // needs to be on up insider, but whatevs
            .on("pointerdown", () => {
                this.game.scene.remove(this)
            })
    }
}
