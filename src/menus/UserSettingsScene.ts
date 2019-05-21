import * as Phaser from "phaser"
import { getUserSettings, changeSettings } from "../user/userManager"

export class UserSettings extends Phaser.Scene {
    constructor() {
        super("UserSettings")
    }

    preload() {
        // Adds the HTML file to the game cache
        this.load.html("nameform", require("../../assets/html/user-form.html"))
    }

    create() {
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
    }
}
