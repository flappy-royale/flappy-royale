import * as Phaser from "phaser"
import { getUserSettings, changeSettings } from "../user/userManager"
import { launchMainMenu } from "./MainMenuScene"
import { Attire, defaultAttire, PresentationAttire } from "../attire"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"
import { isEqual } from "lodash"
import { analyticsEvent } from "../nativeComms/analytics"
import { defaultAttireSet } from "../attire/defaultAttireSet"
import { AttireSet, allAttireSets } from "../attire/attireSets"
import { canWearAttire } from "../user/canWearAttire"
import * as PlayFab from "../playFab"
import { openURL } from "../nativeComms/openURL"

export const YouKey = "YouScene"

const removeChildren = (div: Element) => {
    while (div.hasChildNodes()) {
        div.removeChild(div.lastChild!)
    }
}

export class YouScene extends Phaser.Scene {
    currentAttireSet: AttireSet = defaultAttireSet
    initialAttire: Attire[]

    currentAttire: Attire[] = []

    constructor() {
        super(YouKey)

        const settings = getUserSettings()
        this.initialAttire = settings.aesthetics.attire
        this.currentAttire = settings.aesthetics.attire
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
        const attireIDsWhenOpening = this.initialAttire.map(a => a.id)

        const tabbar = document.getElementById("tabbar")!
        allAttireSets.forEach(a => {
            const li = document.createElement("li")
            li.style.backgroundColor = a.lightHexColor

            const img = document.createElement("img")
            img.src = a.iconPath
            li.appendChild(img)
            tabbar.appendChild(li)

            li.onclick = () => {
                // Reset
                for (const sibling of li.parentElement!.children) {
                    const htmlSib = sibling as HTMLElement
                    htmlSib.style.borderBottom = "none"
                    htmlSib.style.height = `25px`
                    htmlSib.style.opacity = "0.6"
                }

                // Set up the active state
                li.style.borderBottom = `2px solid ${a.darkHexColor}`
                li.style.height = `23px`
                li.style.opacity = "1"

                // Update the content
                setupForAttireSet(a)
            }
        })

        const settings = getUserSettings()

        /**
         * Runs on every selection change and asserts whether an LI
         * corresponding to attire is selected or not
         */
        const updateWearables = () => {
            console.log("---------------")
            const basesRoot = document.getElementById("current-set-clickables")!
            for (const element of basesRoot.getElementsByTagName("li")) {
                const id = element.id
                const isWearing = this.currentAttire.filter(a => !!a).find(a => a.id === id)
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
                img.src = require("../../assets/bases/default/Hedgehog.png")
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
        const updateUserDisplay = () => {
            const user = document.getElementById("you")!
            removeChildren(user)

            const userBase = this.currentAttire.filter(a => !!a).find(a => a.base)
            const img = document.createElement("img")
            img.src = userBase ? userBase.href : defaultAttire.href
            img.className = "you-attire"
            user.appendChild(img)

            const attire = this.currentAttire.filter(a => !a.base)
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
                removeChildren(div)

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
                console.log("removing", div.dataset["attire"])
                this.currentAttire = this.currentAttire.filter(a => a.id !== div.dataset["attire"])
                console.log("now", this.currentAttire)

                updateUserDisplay()
                updateWearables()
            }
        })

        const game = this

        // Click handling
        element.on("click", (event: Event) => {
            const target = event.target as Element

            // Getting a potential attire is tricky, you could hit
            // either the li, the div or the img, so always get to the li.
            const maybeLI = findUpTag(target, "LI")
            if (maybeLI && maybeLI.id) {
                const attire = maybeLI as Element

                const clickedAttire = game.currentAttireSet.attire.find(att => att.id === attire.id)!

                if (!canWearAttire(settings, clickedAttire)) {
                    // TO DO: Tell the user this attire hasn't been unlocked
                    console.log("Can't click this!")
                    return
                }

                // Should we be replacing the body
                if (clickedAttire.base) {
                    // Replace the base
                    const currentClothes = this.currentAttire.filter(a => !a.base)
                    this.currentAttire = [clickedAttire, ...currentClothes]
                } else {
                    const isWearingAttire = this.currentAttire.find(a => a.id === clickedAttire.id)
                    if (!isWearingAttire) {
                        // Add the clothes, up to three items
                        const currentAttireLength = this.currentAttire.filter(a => !a.base).length
                        if (currentAttireLength < 3) {
                            this.currentAttire.push(clickedAttire)
                        }
                    } else {
                        // remove it
                        this.currentAttire = this.currentAttire.filter(a => a.id !== clickedAttire.id)
                    }
                }

                updateUserDisplay()
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

            removeChildren(basesUL)
            removeChildren(attiresUL)
            bases.forEach(a => makeClickableAttire(a, basesUL))
            attires.forEach(a => makeClickableAttire(a, attiresUL))

            // Run all the interactions upfront
            updateWearables()

            for (const title of document.getElementsByClassName("style-title")) {
                const element = title as HTMLElement
                element.style.color = set.darkHexColor
            }

            const attribution = document.getElementById("current-set-attribution")!
            const attributionA = attribution.getElementsByTagName("a").item(0)!
            attributionA.text = set.attributedTo
            attributionA.style.color = set.darkHexColor
            attributionA.onclick = () => {
                openURL(set.attributedURL)
            }
        }

        // Click the first tab bar, this actually ignores the initialAttire
        const firstItem = tabbar.getElementsByTagName("li").item(0)!
        if (firstItem.onclick) firstItem.onclick({} as any)

        // Makes sure the user is set up
        updateUserDisplay()

        const header = document.getElementById("header") as HTMLImageElement
        header.src = require("../../assets/menu/RedSash.png")
        const footer = document.getElementById("footer") as HTMLImageElement
        footer.src = require("../../assets/menu/BottomSash.png")
        const back = document.getElementById("back") as HTMLImageElement
        back.src = require("../../assets/menu/Back2.png")

        back.onclick = () => {
            const newAttireIDs = this.currentAttire.map(a => a.id)
            if (!isEqual(newAttireIDs, attireIDsWhenOpening)) {
                analyticsEvent("new_attire", { ids: newAttireIDs })
                PlayFab.updateAttire(this.currentAttire, getUserSettings().aesthetics.attire)
                changeSettings({ aesthetics: { attire: this.currentAttire } })
            }

            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }
    }
}
