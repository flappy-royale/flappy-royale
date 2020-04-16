import * as Phaser from "phaser"
import { GameWidth, GameHeight } from "../constants"
import { launchMainMenu } from "./MainMenuScene"
import { fetchRecordingsForSeed } from "../server"
import { preloadBirdAttire } from "../battle/BirdSprite"
import { BattleScene } from "../battle/Scene"
import { GameMode } from "../battle/utils/gameMode"
import _ = require("lodash")
import { random, shuffle } from "lodash"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"
import { addScene } from "./utils/addScene"
import { GameTheme } from "../battle/theme"
import { defaultAttire, Attire } from "../attire"
import { avatarUrlToAttire } from "../playFab"
import { SeedData } from "../serverTypes"

export const RoyaleLobbyKey = "RoyaleLobby"

export interface RoyaleLobbyProps {
    seed: string
}

export class RoyaleLobby extends Phaser.Scene {
    private seed: string

    private countdownTime: number = 0
    private hasReadied: boolean = false

    snapshotMode: boolean = false

    // If true, we can safely start the game
    private seedData?: SeedData

    constructor(props: RoyaleLobbyProps) {
        super("RoyaleLobbyScene")
        this.seed = props.seed
        console.log("Starting Royale with seed: " + props.seed)
    }

    preload() {
        // Adds the HTML file to the game cache
        this.load.html("RoyaleLobby", require("../../assets/html/RoyaleLobby.html"))
        this.load.image("bottom-sash", require("../../assets/menu/BottomSash.png"))
        this.load.image("white-circle", require("../../assets/menu/Circle.png"))
        this.load.image("purple-sash", require("../../assets/menu/PurpleishSash.png"))
        this.load.image("white-triangle-sash", require("../../assets/menu/WhiteTriangleSlashShape.png"))
        this.load.image("attire-selected", require("../../assets/menu/AttireSelected.png"))
    }

    create() {
        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0xacd49d)

        // Make a HTML form
        const el = this.add
            .dom(0, 0)
            .setOrigin(0, 0)
            .createFromCache("RoyaleLobby")
        resizeToFullScreen(el)

        // Number of seconds until the game starts
        this.countdownTime = random(3, 5) + 1

        fetchRecordingsForSeed(this.seed).then(this.processSeedData)

        const header = document.getElementById("header") as HTMLImageElement
        header.src = require("../../assets/menu/PurpleishSash.png")

        const footer = document.getElementById("footer") as HTMLImageElement
        footer.src = require("../../assets/menu/BottomSash.png")

        const back = document.getElementById("back") as HTMLImageElement
        back.src = require("../../assets/menu/Back2.png")

        const whiteSlash = document.getElementById("white-slash") as HTMLImageElement
        whiteSlash.src = require("../../assets/menu/WhiteTriangleSlashShape.png")

        const whiteCircle = document.getElementById("white-circle") as HTMLImageElement
        whiteCircle.src = require("../../assets/menu/Circle.png")

        const buttonBG = document.getElementById("button-bg") as HTMLImageElement
        buttonBG.src = require("../../assets/menu/ButtonBG.png")

        document.getElementById("back")!.onclick = () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }

        document.getElementById("button")!.addEventListener(
            "click",
            () => {
                this.hasReadied = true
                if (this.countdownTime <= 0) {
                    this.startTheGame()
                }
                this.updateCountdownLabel()
            },
            { once: true }
        )

        // Start the countdown timer
        let timeout: number | undefined
        const updateTimer = () => {
            this.countdownTime -= 1

            if (this.countdownTime <= 0 && this.seedData && this.hasReadied) {
                this.startTheGame()
                return
            }

            this.updateCountdownLabel()

            if (!this.snapshotMode) {
                timeout = <number>(<unknown>setTimeout(updateTimer, 1000))
            }
        }
        updateTimer()

        this.events.on("destroy", () => {
            clearTimeout(timeout)
        })
    }

    processSeedData = (seedData: SeedData) => {
        this.seedData = seedData

        var numberOfEnemies = seedData.replays.length
        var duration = _.random(this.countdownTime - 2, this.countdownTime) * 1000

        if (this.snapshotMode) {
            duration = 0
            numberOfEnemies = 99
        }

        const birdCount = document.getElementById("you-vs")!

        this.tweens.addCounter({
            from: 0,
            to: numberOfEnemies,
            ease: "Cubic",
            duration: duration,
            repeat: 0,
            onUpdate: (v: Phaser.Tweens.Tween) =>
                (birdCount.innerHTML = `You vs <span>${pad(Math.round(v.getValue()), 2)}</span> birds`)
        })

        const birds = document.getElementById("birds")!
        shuffle(seedData.replays).forEach(score => {
            let attire: Attire[]
            let name: string

            if (score.playfabUser) {
                attire = avatarUrlToAttire(score.playfabUser.avatarUrl)
                name = score.playfabUser.name
            } else {
                return
            }

            const birdLi = document.createElement("li")

            preloadBirdAttire(this, attire)
            const previewDiv = this.createUserImage(attire)

            const theirName = document.createElement("p")
            theirName.innerText = name

            birdLi.appendChild(previewDiv)
            birdLi.appendChild(theirName)
            birds.appendChild(birdLi)
        })

        this.load.start()
    }

    createUserImage(attire: Attire[]) {
        const root = document.createElement("div")

        const userBase = attire.find(a => a.base)
        const img = document.createElement("img")
        img.src = userBase ? userBase.href : defaultAttire.href
        img.className = "you-attire"
        root.appendChild(img)

        attire
            .filter(a => !a.base)
            .forEach(a => {
                const attireImg = document.createElement("img")
                attireImg.src = a.href
                attireImg.className = "you-attire"
                root.appendChild(attireImg)
            })

        const wings = document.createElement("img")
        wings.src = require("../../assets/battle/flap-gif.gif")
        wings.className = "you-attire"
        root.appendChild(wings)

        return root
    }

    private startTheGame() {
        this.game.scene.remove(this)
        const scene = new BattleScene({
            seed: this.seed,
            data: this.seedData!, // Can only get here once it's downloaded
            gameMode: GameMode.Royale,
            theme: GameTheme.default
        })
        addScene(this.game, "BattleScene" + this.seed, scene, true, {})
        scene.playBusCrash()
    }

    private updateCountdownLabel() {
        const countdownButton = document.getElementById("countdown-description")!
        let period = "." // Tracks "hold on..." periods if we don't load seeds in time

        if (!this.hasReadied) {
            return
        }

        if (this.countdownTime > 0) {
            countdownButton.innerHTML = `starts in <span id="countdown-time">${this.countdownTime}</span> s`
            document.getElementById("button-bg")!.style.opacity = "0.3"
        } else if (!this.seedData) {
            countdownButton.innerText = `hold on${period}`
            period += "."
            if (period === "....") {
                period = ""
            }
        }
    }
}

function pad(n: any, width: any, z?: any) {
    z = z || "0"
    n = n + ""
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
