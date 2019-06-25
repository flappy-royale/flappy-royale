import * as Phaser from "phaser"
import {
    UserSettings,
    getLives,
    livesExtensionStateForSeed,
    LifeStateForSeed,
    bumpLivesExtensionState,
    addLives,
    livesExtensionsButtonTitleForState
} from "../user/userManager"
import { GameWidth, GameHeight } from "../constants"
import { launchMainMenu } from "./MainMenuScene"
import { fetchRecordingsForSeed } from "../firebase"
import { preloadBirdAttire } from "../battle/BirdSprite"
import { BattleScene } from "../battle/Scene"
import { GameMode } from "../battle/utils/gameMode"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"
import { requestModalAd, prepareModalAd } from "../nativeComms/requestModalAd"
import { addScene } from "./utils/addScene"
import { analyticsEvent } from "../nativeComms/analytics"
import { GameTheme } from "../battle/theme"

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
        this.load.image("white-triangle-sash", require("../../assets/menu/WhiteTriangleShapeTrials.png"))
        this.load.image("attire-selected", require("../../assets/menu/AttireSelected.png"))
    }

    create() {
        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0xeb9599)

        // Make a HTML form
        const domEl = this.add
            .dom(0, 0)
            .setOrigin(0, 0)
            .createFromCache("Lobby")
        resizeToFullScreen(domEl)

        const lives = getLives(this.seed)

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

        const outOfLives = lives === 0
        const livesState = livesExtensionStateForSeed(this.seed)

        // Changes the button at the bottom to note about how you can add more lives
        // which triggers and ad
        if (outOfLives) {
            document.getElementById("button-text").textContent = livesExtensionsButtonTitleForState(livesState)
            analyticsEvent("out_of_lives", { livesState })
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

                if (lives <= 0) {
                    prepareModalAd(livesState)
                }

                goButton.onclick = () => {
                    const playGame = () => {
                        this.game.scene.remove(this)
                        const scene = new BattleScene({
                            seed: this.seed,
                            data: seedData,
                            gameMode: GameMode.Trial,
                            theme: GameTheme.default
                        })
                        addScene(this.game, "BattleScene" + this.seed, scene, true, {})
                        scene.playBusCrash()
                    }

                    if (lives !== 0) {
                        playGame()
                        return
                    } else {
                        requestModalAd(livesState)
                    }
                    // Show an ad modal for lives, then play the game again
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

        const info = document.getElementById("info")
        const tries = lives === 1 ? "try" : "tries"
        info.innerHTML = `Today's leaderboard<br />${lives} ${tries} left`

        /// NOOP
        if (lives === 0 && livesState === LifeStateForSeed.ExtraFifteen) {
            buttonBG.style.opacity = "0.3"
        }
    }

    adsHaveBeenUnlocked() {
        bumpLivesExtensionState(this.seed)

        let livesToAdd = 0
        switch (livesExtensionStateForSeed(this.seed)) {
            case LifeStateForSeed.ExtraFive:
                livesToAdd = 5
                break

            case LifeStateForSeed.ExtraTen:
                livesToAdd = 10
                break

            case LifeStateForSeed.ExtraFifteen:
                livesToAdd = 15
                break
        }

        addLives(this.seed, livesToAdd)

        setTimeout(() => {
            alert(
                `Thanks for supporting Flappy Royale! You've earned an additional ${livesToAdd} tries for today's Daily Trial.`
            )
        }, 100)

        const info = document.getElementById("info")
        info.innerHTML = `Daily scoreboard<br />${livesToAdd} tries left`

        document.getElementById("button-text").textContent = "start"

        const goButton = document.getElementById("button")
        goButton.onclick = () => {
            fetchRecordingsForSeed(this.seed).then(seedData => {
                this.game.scene.remove(this)
                const scene = new BattleScene({
                    seed: this.seed,
                    data: seedData,
                    gameMode: GameMode.Trial,
                    theme: GameTheme.default
                })
                addScene(this.game, "BattleScene" + this.seed, scene, true, {})
                scene.playBusCrash()
            })
        }
    }
}

function pad(n: any, width: any, z?: any) {
    z = z || "0"
    n = n + ""
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
