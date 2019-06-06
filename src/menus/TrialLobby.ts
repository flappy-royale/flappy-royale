import * as Phaser from "phaser"
import { changeSettings, UserSettings } from "../user/userManager"
import { GameWidth, GameHeight } from "../constants"
import { launchMainMenu } from "./MainMenuScene"
import { fetchRecordingsForSeed } from "../firebase"
import { preloadBirdAttire } from "../battle/BirdSprite"
import { BattleScene } from "../battle/Scene"
import { GameMode } from "../battle/utils/gameMode"

export const RoyaleLobbyKey = "RoyaleLobby"

export interface RoyaleLobbyProps {
    seed: string
}

export class TrialLobby extends Phaser.Scene {
    private seed: string

    constructor(props: RoyaleLobbyProps) {
        super("RoyaleLobbyScene")
        this.seed = props.seed
        console.log("Starting Royale with seed: " + props.seed)
    }

    preload() {
        // Adds the HTML file to the game cache
        this.load.html("Lobby", require("../../assets/html/TrialLobby.html"))
        this.load.image("bottom-sash", require("../../assets/menu/BottomSash.png"))
        this.load.image("white-circle", require("../../assets/menu/Circle.png"))
        this.load.image("purple-sash", require("../../assets/menu/PurpleishSash.png"))
        this.load.image("white-sash", require("../../assets/menu/WhiteTriangleShapeTrials.png"))
        this.load.image("attire-selected", require("../../assets/menu/AttireSelected.png"))
    }

    create() {
        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0xeb9599)

        // Make a HTML form
        this.add.dom(GameWidth / 2, GameHeight / 2).createFromCache("Lobby")

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
            const birds = document.getElementById("birds")
            seedData.replays
                .sort((l, r) => r.score - l.score)
                .forEach(score => {
                    preloadBirdAttire(this, score.user)

                    const birdLi = document.createElement("li")
                    const previewDiv = createUserImage(score.user)
                    const theirName = document.createElement("p")
                    theirName.innerHTML = `<span>${pad(score.score, 2)}</span>${score.user.name}`

                    birdLi.appendChild(previewDiv)
                    birdLi.appendChild(theirName)
                    birds.appendChild(birdLi)
                })

            const preloadAssetsDone = () => {
                const goButton = document.getElementById("button")

                goButton.onclick = () => {
                    this.game.scene.remove(this)
                    const scene = new BattleScene({ seed: this.seed, data: seedData, gameMode: GameMode.Trial })
                    this.game.scene.add("BattleScene" + this.seed, scene, true, {})
                }
            }

            this.load.once("complete", preloadAssetsDone, this)
            this.load.start()
        })

        const header = document.getElementById("header") as HTMLImageElement
        header.src = require("../../assets/menu/PurpleishSash.png")

        const footer = document.getElementById("footer") as HTMLImageElement
        footer.src = require("../../assets/menu/BottomSash.png")

        const back = document.getElementById("back") as HTMLImageElement
        back.src = require("../../assets/menu/Back2.png")

        const whiteSlash = document.getElementById("white-slash") as HTMLImageElement
        whiteSlash.src = require("../../assets/menu/WhiteTriangleShapeTrials.png")

        const whiteCircle = document.getElementById("white-circle") as HTMLImageElement
        whiteCircle.src = require("../../assets/menu/Circle.png")

        const buttonBG = document.getElementById("button-bg") as HTMLImageElement
        buttonBG.src = require("../../assets/menu/ButtonBG.png")

        document.getElementById("back").onclick = () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }
    }
}

function pad(n: any, width: any, z?: any) {
    z = z || "0"
    n = n + ""
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
