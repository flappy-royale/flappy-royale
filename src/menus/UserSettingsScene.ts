import * as Phaser from "phaser"
import { getUserSettings, changeSettings, Attire } from "../user/userManager"
import { GameWidth, GameHeight } from "../constants"
import { MainMenuScene, launchMainMenu } from "./MainMenuScene"
import { builtInAttire, defaultAttire } from "../attire"

export const UserSettingsKey = "UserSettings"

export class UserSettings extends Phaser.Scene {
    constructor() {
        super(UserSettingsKey)
    }

    preload() {
        // Adds the HTML file to the game cache
        this.load.html("name-form", require("../../assets/html/user-form.html"))
        this.load.image("back-button", require("../../assets/menu/back.png"))
    }

    create() {
        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0xff0000)

        // Make a HTML form
        var element = this.add.dom(75, 90).createFromCache("name-form")
        element.addListener("click")

        // Grab the username via the DOM API
        const usernameInput = element.node.getElementsByTagName("input").item(0)
        const settings = getUserSettings()
        usernameInput.value = settings.name

        const bases = builtInAttire.filter(a => a.base)
        const attires = builtInAttire.filter(a => !a.base)

        const basesUL = element.node.getElementsByClassName("bases").item(0)
        const attiresUL = element.node.getElementsByClassName("attires").item(0)

        const updateWearables = () => {
            const settings = getUserSettings()
            for (const element of document.getElementsByTagName("li")) {
                const id = element.id
                const isWearing = settings.aesthetics.attire.find(a => a.id === id)
                element.className = isWearing ? "attire" : "attire wearing"
            }
        }

        const makeClickableAttire = (attire: Attire, element: Element) => {
            const li = document.createElement("li")
            li.id = attire.id

            const img = document.createElement("img")
            img.src = attire.href
            li.appendChild(img)

            element.appendChild(li)
        }

        bases.forEach(a => makeClickableAttire(a, basesUL))
        attires.forEach(a => makeClickableAttire(a, attiresUL))

        const showUser = () => {
            const settings = getUserSettings()

            const user = element.node.getElementsByClassName("you").item(0)
            while (user.hasChildNodes()) {
                user.removeChild(user.lastChild)
            }

            const userBase = settings.aesthetics.attire.find(a => a.base)
            const img = document.createElement("img")
            img.src = userBase.href
            img.className = "you-attire"
            user.appendChild(img)

            settings.aesthetics.attire
                .filter(a => !a.base)
                .forEach(a => {
                    const attireImg = document.createElement("img")
                    attireImg.src = a.href
                    attireImg.className = "you-attire"
                    user.appendChild(attireImg)
                })

            const wings = document.createElement("img")
            wings.src = require("../../assets/battle/flap-gif.gif")
            wings.className = "you-attire"
            user.appendChild(wings)
        }

        updateWearables()

        element.on("click", function(event) {
            const target = event.target as Element

            // Getting a potential attire is tricky, you could hit
            // either the li or the img, so always get to the li.
            let attire = null as null | Element
            if (target.tagName === "IMG") {
                if (target.parentElement.tagName === "LI" && target.parentElement.className.includes("attire")) {
                    attire = target.parentElement
                }
            } else if (target.parentElement.tagName === "LI" && target.parentElement.className.includes("attire")) {
                attire = target
            }

            // Looks like we were on some attire
            if (attire) {
                const settings = getUserSettings()
                const currentAttire = settings.aesthetics.attire
                const clickedAttire = builtInAttire.find(att => att.id === attire.id)

                // Should we be replacing the body
                if (clickedAttire.base) {
                    // Replace the base
                    const currentClothes = currentAttire.filter(a => !a.base)
                    changeSettings({ aesthetics: { attire: [clickedAttire, ...currentClothes] } })
                } else {
                    const isWearingAttire = currentAttire.find(a => a.id === clickedAttire.id)
                    if (!isWearingAttire) {
                        // Add the clothes, up to three items
                        changeSettings({ aesthetics: { attire: [...currentAttire, clickedAttire] } })
                    } else {
                        // remove it
                        const currentClothes = currentAttire.filter(a => a.id !== clickedAttire.id)
                        changeSettings({ aesthetics: { attire: currentClothes } })
                    }
                }

                showUser()
                updateWearables()
            }

            if (event.target.name === "loginButton") {
                const usernameInput = element.node.getElementsByTagName("input").item(0)
                changeSettings({ name: usernameInput.value })
                this.removeListener("click")
            }
        })

        showUser()

        this.add
            .image(80, 200, "back-button")
            .setInteractive()
            // needs to be on up insider, but whatever
            .on("pointerdown", () => {
                this.game.scene.remove(this)
                launchMainMenu(this.game)
            })
    }
}
