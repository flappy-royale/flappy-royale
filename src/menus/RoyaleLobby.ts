import * as Phaser from "phaser"
import { UserSettings } from "../user/userManager"
import { GameWidth, GameHeight } from "../constants"
import { launchMainMenu } from "./MainMenuScene"
import { fetchRecordingsForSeed, SeedData } from "../firebase"
import { preloadBirdAttire } from "../battle/BirdSprite"
import { BattleScene } from "../battle/Scene"
import { GameMode } from "../battle/utils/gameMode"
import _ = require("lodash")
import { random, shuffle } from "lodash"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"
import { addScene } from "./utils/addScene"

export const RoyaleLobbyKey = "RoyaleLobby"

export interface RoyaleLobbyProps {
    seed: string
}

export class RoyaleLobby extends Phaser.Scene {
    private seed: string

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
        this.load.image("white-sash", require("../../assets/menu/WhiteTriangleSlashShape.png"))
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
        let countdownTime = random(4, 6) + 1

        const createUserImage = (user: UserSettings) => {
            const root = document.createElement("div")

            const userBase = user.aesthetics.attire.find(a => a.base)
            const img = document.createElement("img")
            img.src = userBase.href
            img.className = "you-attire"
            root.appendChild(img)

            user.aesthetics.attire
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

        fetchRecordingsForSeed(this.seed).then(seedData => {
            this.seedData = seedData

            let duration = _.random(countdownTime - 2, countdownTime) * 1000

            const birdCount = document.getElementById("you-vs")

            this.tweens.addCounter({
                from: 0,
                to: seedData.replays.length,
                ease: "Cubic",
                duration: duration,
                repeat: 0,
                onUpdate: (v: Phaser.Tweens.Tween) =>
                    (birdCount.innerHTML = `You vs <span>${pad(Math.round(v.getValue()), 2)}</span> birds`)
            })

            const birds = document.getElementById("birds")
            shuffle(seedData.replays).forEach(score => {
                preloadBirdAttire(this, score.user)

                const birdLi = document.createElement("li")
                const previewDiv = createUserImage(score.user)
                const theirName = document.createElement("p")
                theirName.innerText = score.user.name

                birdLi.appendChild(previewDiv)
                birdLi.appendChild(theirName)
                birds.appendChild(birdLi)
            })

            this.load.start()
        })

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

        document.getElementById("back").onclick = () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }

        // Start the countdown timer
        let period = "." // Tracks "hold on..." periods if we don't load seeds in time

        const countdownButton = document.getElementById("countdown-description")
        const countdownTimerText = document.getElementById("countdown-time")

        let timeout: number | undefined
        const updateTimer = () => {
            countdownTime -= 1

            if (countdownTime <= 0) {
                if (this.seedData) {
                    // Load the game!
                    this.game.scene.remove(this)

                    const scene = new BattleScene({ seed: this.seed, data: this.seedData, gameMode: GameMode.Royale })
                    addScene(this.game, "BattleScene" + this.seed, scene, true, {})
                    scene.playBusCrash()
                    return
                } else {
                    countdownButton.innerText = `hold on${period}`
                    period += "."
                    if (period === "....") {
                        period = ""
                    }
                }
            } else {
                countdownTimerText.innerText = `${countdownTime}`
            }
            timeout = <number>(<unknown>setTimeout(updateTimer, 1000))
        }
        updateTimer()

        this.events.on("destroy", () => {
            clearTimeout(timeout)
        })
    }
}

function pad(n: any, width: any, z?: any) {
    z = z || "0"
    n = n + ""
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
