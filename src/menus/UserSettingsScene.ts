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
        this.load.image("bottom-sash", require("../../assets/menu/BottomSash.png"))
        this.load.image("white-circle", require("../../assets/menu/Circle.png"))
        this.load.image("attire-empty", require("../../assets/menu/AttireSelectionEmpty.png"))
        this.load.image("attire-selected", require("../../assets/menu/AttireSelected.png"))
    }

    create() {
        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0xe7d866)

        // Bottom BG
        this.add.image(GameWidth / 2, GameHeight - 0, "bottom-sash")

        // Make a HTML form
        var element = this.add.dom(GameWidth / 2, GameHeight / 2).createFromCache("name-form")
        element.addListener("click")

        // Set the circle BG on the you bird
        const you = document.getElementById("you-sticky")
        const youBG = you.getElementsByTagName("img").item(0)
        youBG.src = require("../../assets/menu/Circle.png")

        // Grab the username via the DOM API
        const usernameInput = element.node.getElementsByTagName("input").item(0)
        const settings = getUserSettings()
        usernameInput.value = settings.name

        const bases = builtInAttire.filter(a => a.base)
        const attires = builtInAttire.filter(a => !a.base)

        const basesUL = element.node.getElementsByClassName("bases").item(0)
        const attiresUL = element.node.getElementsByClassName("attires").item(0)

        /**
         * Runs on every selection change and asserts whether an LI
         * corresponding to attire is selected or not
         */
        const updateWearables = () => {
            const settings = getUserSettings()
            for (const element of document.getElementsByTagName("li")) {
                const id = element.id
                const isWearing = settings.aesthetics.attire.find(a => a.id === id)
                const wearing = `url(${require("../../assets/menu/AttireSelected.png")})`
                const notWearing = `url(${require("../../assets/menu/AttireSelectionEmpty.png")})`
                element.style.backgroundImage = isWearing ? wearing : notWearing
            }

            const attires = settings.aesthetics.attire.filter(a => !a.base)
            const styleCount = document
                .getElementById("style-title")
                .getElementsByTagName("span")
                .item(0)
            styleCount.textContent = `${attires.length}/3`
        }

        const makeClickableAttire = (attire: Attire, element: Element) => {
            const li = document.createElement("li")
            li.id = attire.id

            const div = document.createElement("div")
            div.className = "render"
            li.appendChild(div)

            if (!attire.base) {
                const img = document.createElement("img")
                img.src = require("../../assets/bases/BirdBody.png")
                img.style.opacity = "0.1"
                div.appendChild(img)
            }

            const img = document.createElement("img")
            img.src = attire.href
            div.appendChild(img)

            element.appendChild(li)
        }

        /** Goes up the parent tree till it finds a particular tag */
        const findUpTag = (el: any, tag: string): Element | null => {
            while (el.parentNode) {
                el = el.parentNode
                if (el.tagName === tag) return el
            }
            return null
        }

        bases.forEach(a => makeClickableAttire(a, basesUL))
        attires.forEach(a => makeClickableAttire(a, attiresUL))

        const showUser = () => {
            const settings = getUserSettings()

            const user = document.getElementById("you")
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
            // either the li, the div or the img, so always get to the li.
            const maybeLI = findUpTag(target, "LI")
            if (maybeLI && maybeLI.id) {
                const attire = maybeLI as Element

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
            .image(14, 224, "back-button")
            .setInteractive()
            // needs to be on up insider, but whatever
            .on("pointerdown", () => {
                this.game.scene.remove(this)
                launchMainMenu(this.game)
            })
    }
}
