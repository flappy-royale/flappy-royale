import * as Phaser from "phaser"
import { getUserSettings, changeSettings } from "../user/userManager"
import { launchMainMenu } from "./MainMenuScene"
import { Attire, defaultAttire, PresentationAttire } from "../attire"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"
import { isEqual } from "lodash"
import { analyticsEvent } from "../nativeComms/analytics"
import { defaultAttireSet } from "../attire/defaultAttire"
import { AttireSet, allAttireSets } from "../attire/attireSets"
import { canWearAttire } from "../user/canWearAttire"
import * as PlayFab from "../playFab"

export const YouKey = "YouScene"

export class YouScene extends Phaser.Scene {
    currentAttireSet: AttireSet = defaultAttireSet
    initialAttire: Attire[]

    constructor() {
        super(YouKey)
        this.initialAttire = getUserSettings().aesthetics.attire
    }

    preload() {
        // Adds the HTML file to the game cache
        this.load.html("You", require("../../assets/html/You.html"))
        this.load.image("debugger-button", require("../../assets/menu/Back2.png"))
        this.load.image("bottom-sash", require("../../assets/menu/BottomSash.png"))
        this.load.image("white-circle", require("../../assets/menu/Circle.png"))
        this.load.image("attire-empty", require("../../assets/menu/AttireSelectionEmpty.png"))
        this.load.image("attire-selected", require("../../assets/menu/AttireSelected.png"))
    }

    create() {
        // Make a HTML form
        var element = this.add
            .dom(0, 0)
            .setOrigin(0, 0)
            .createFromCache("You")
        resizeToFullScreen(element)
        element.addListener("click")

        // Set the circle BG on the you bird
        const you = document.getElementById("you-sticky")!
        const youBG = you.getElementsByTagName("img").item(0)!
        youBG.src = require("../../assets/menu/Circle.png")

        // Set the default value
        const settings = getUserSettings()
        const attireIDsWhenOpening = settings.aesthetics.attire.map(a => a.id)

        const tabbar = document.getElementById("tabbar")!
        allAttireSets.forEach(a => {
            const li = document.createElement("li")
            li.style.backgroundColor = a.lightHexColor

            const img = document.createElement("img")
            img.src = a.iconPath
            li.appendChild(img)
            tabbar.appendChild(li)
        })

        /**
         * Runs on every selection change and asserts whether an LI
         * corresponding to attire is selected or not
         */
        const updateWearables = () => {
            const settings = getUserSettings()
            const basesRoot = document.getElementById("current-set-clickables")!
            for (const element of basesRoot.getElementsByTagName("li")) {
                const id = element.id
                const isWearing = settings.aesthetics.attire.filter(a => !!a).find(a => a.id === id)
                const wearing = `url(${require("../../assets/menu/AttireSelected.png")})`
                const notWearing = `url(${require("../../assets/menu/AttireSelectionEmpty.png")})`
                element.style.backgroundImage = isWearing ? wearing : notWearing
            }
        }

        /** Generates the HTML to create a clickable item for attire, and adds it to the element  */
        const makeClickableAttire = (attire: PresentationAttire, element: Element) => {
            const li = document.createElement("li")
            li.id = attire.id

            const div = document.createElement("div")
            div.className = "render"
            li.appendChild(div)

            if (!attire.base) {
                const img = document.createElement("img")
                img.src = require("../../assets/bases/Hedgehog.png")
                img.style.opacity = "0.1"
                div.appendChild(img)
            }

            const img = document.createElement("img")
            img.src = attire.href
            div.appendChild(img)

            if (!canWearAttire(settings, attire)) {
                li.classList.add("locked")
            }

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

        /** Creates and updates the unique 'you' preview along the side */
        const showUser = () => {
            const settings = getUserSettings()

            const user = document.getElementById("you")!
            while (user.hasChildNodes()) {
                user.removeChild(user.lastChild!)
            }

            const userBase = settings.aesthetics.attire.filter(a => !!a).find(a => a.base)
            const img = document.createElement("img")
            img.src = userBase ? userBase.href : defaultAttire.href
            img.className = "you-attire"
            user.appendChild(img)

            const attire = settings.aesthetics.attire.filter(a => !a.base)
            attire.forEach(a => {
                const attireImg = document.createElement("img")
                attireImg.src = a.href
                attireImg.className = "you-attire"
                user.appendChild(attireImg)
            })

            const wings = document.createElement("img")
            wings.src = require("../../assets/battle/flap-gif.gif")
            wings.className = "you-attire"
            user.appendChild(wings)

            const attires = ["attire-0", "attire-1", "attire-2"]
            attires.forEach((divID, index) => {
                const div = document.getElementById(divID)!
                // Clean up
                while (div.hasChildNodes()) {
                    div.removeChild(div.lastChild!)
                }

                const showingAttire = attire[index]
                if (showingAttire) {
                    div.dataset["attire"] = showingAttire.id

                    const attireImg = document.createElement("img")
                    attireImg.src = showingAttire.href
                    attireImg.className = "you-attire"

                    const x = document.createElement("img")
                    x.src = require("../../assets/menu/x.png")
                    x.className = "x"

                    div.appendChild(x)
                    div.appendChild(attireImg)
                }
            })
        }

        const attires = ["attire-0", "attire-1", "attire-2"]
        attires.forEach(divID => {
            const div = document.getElementById(divID)!
            div.onclick = () => {
                const settings = getUserSettings()
                const currentAttire = settings.aesthetics.attire
                console.log("removing", div.dataset["attire"])
                const currentClothes = currentAttire.filter(a => a.id !== div.dataset["attire"])
                console.log("now", currentClothes)
                changeSettings({ aesthetics: { attire: currentClothes } })

                showUser()
                updateWearables()
            }
        })

        const game = this

        // Click handling
        element.on("click", function(event: Event) {
            const target = event.target as Element

            // Getting a potential attire is tricky, you could hit
            // either the li, the div or the img, so always get to the li.
            const settings = getUserSettings()
            const maybeLI = findUpTag(target, "LI")
            if (maybeLI && maybeLI.id) {
                const attire = maybeLI as Element

                const currentAttire = settings.aesthetics.attire
                const clickedAttire = game.currentAttireSet.attire.find(att => att.id === attire.id)!

                if (!canWearAttire(settings, clickedAttire)) {
                    // TO DO: Tell the user this attire hasn't been unlocked
                    console.log("Can't click this!")
                    return
                }

                // Should we be replacing the body
                if (clickedAttire.base) {
                    // Replace the base
                    const currentClothes = currentAttire.filter(a => !a.base)
                    changeSettings({ aesthetics: { attire: [clickedAttire, ...currentClothes] } })
                } else {
                    const isWearingAttire = currentAttire.find(a => a.id === clickedAttire.id)
                    if (!isWearingAttire) {
                        // Add the clothes, up to three items
                        const currentAttireLength = currentAttire.filter(a => !a.base).length
                        if (currentAttireLength < 3) {
                            changeSettings({ aesthetics: { attire: [...currentAttire, clickedAttire] } })
                        }
                    } else {
                        // remove it
                        const currentClothes = currentAttire.filter(a => a.id !== clickedAttire.id)
                        changeSettings({ aesthetics: { attire: currentClothes } })
                    }
                }

                showUser()
                updateWearables()
            }
        })

        // Sets up the attires

        const setupForAttireSet = (set: AttireSet) => {
            const bg = document.getElementsByClassName("screen").item(0)!
            const bgElement = bg as HTMLElement
            bgElement.style.backgroundColor = set.lightHexColor

            const title = document.getElementById("current-set-name")!
            title.textContent = set.name
            title.style.backgroundColor = set.darkHexColor

            // This filter/concat chain is silly, but maintains ordering other than locked status
            let bases = set.attire.filter(a => a.base)
            bases = bases.filter(a => canWearAttire(settings, a)).concat(bases.filter(a => !canWearAttire(settings, a)))

            let attires = set.attire.filter(a => !a.base)
            attires = attires
                .filter(a => canWearAttire(settings, a))
                .concat(attires.filter(a => !canWearAttire(settings, a)))

            const basesUL = element.node.getElementsByClassName("bases").item(0)!
            const attiresUL = element.node.getElementsByClassName("attires").item(0)!

            bases.forEach(a => makeClickableAttire(a, basesUL))
            attires.forEach(a => makeClickableAttire(a, attiresUL))

            // Run all the interactions upfront
            updateWearables()

            for (const title of document.getElementsByClassName("style-title")) {
                const element = title as HTMLElement
                element.style.color = set.darkHexColor
            }
        }

        setupForAttireSet(this.currentAttireSet)

        showUser()

        const header = document.getElementById("header") as HTMLImageElement
        header.src = require("../../assets/menu/RedSash.png")
        const footer = document.getElementById("footer") as HTMLImageElement
        footer.src = require("../../assets/menu/BottomSash.png")
        const back = document.getElementById("back") as HTMLImageElement
        back.src = require("../../assets/menu/Back2.png")

        back.onclick = () => {
            const newSettings = getUserSettings()
            const newAttireIDs = newSettings.aesthetics.attire.map(a => a.id)

            if (!isEqual(newAttireIDs, attireIDsWhenOpening)) {
                analyticsEvent("new_attire", { ids: newAttireIDs })
                PlayFab.updateAttire(newSettings.aesthetics!.attire)
            }

            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }
    }
}
