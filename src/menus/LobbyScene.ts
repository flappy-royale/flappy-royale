import * as Phaser from "phaser"

export class LobbyScene extends Phaser.Scene {
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
    }
}
