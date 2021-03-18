import * as Phaser from "phaser"
import {
    getLives,
    livesExtensionStateForSeed,
    LifeStateForSeed,
    bumpLivesExtensionState,
    addLives,
    livesExtensionsButtonTitleForState,
    livesExtensionsButtonToAdID
} from "../user/userManager"
import { GameWidth, GameHeight } from "../constants"
import { launchMainMenu } from "./MainMenuScene"
import { preloadBirdAttire } from "../battle/BirdSprite"
import { BattleScene } from "../battle/Scene"
import { GameMode } from "../battle/utils/gameMode"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"
import { requestModalAd, prepareModalAd } from "../nativeComms/requestModalAd"
import { addScene } from "./utils/addScene"
import { analyticsEvent } from "../nativeComms/analytics"
import { GameTheme } from "../battle/theme"
import { getTrialLobbyLeaderboard } from "../playFab"
import { Attire, defaultAttire } from "../attire"
import { emptySeedData } from "../firebase"
import { Prompt, showPrompt } from "./Prompt"
import { BackgroundScene, showBackgroundScene } from "./BackgroundScene"

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

        const createUserImage = (attire: Attire[]) => {
            const root = document.createElement("div")

            const userBase = attire.find(a => a && a.base)
            const img = document.createElement("img")
            img.src = userBase ? userBase.href : defaultAttire.href
            img.className = "you-attire"
            root.appendChild(img)

            attire
                .filter(a => a && !a.base)
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
            document.getElementById("button-text")!.textContent = livesExtensionsButtonTitleForState(livesState)
            analyticsEvent("out_of_lives", { livesState })
        }

        getTrialLobbyLeaderboard().then(leaderboard => {
            const birds = document.getElementById("birds")!
            leaderboard.results.forEach(result => {
                preloadBirdAttire(this, result.attire)

                const birdLi = document.createElement("li")
                const previewDiv = createUserImage(result.attire)
                const theirName = document.createElement("p")
                theirName.innerHTML = `<span>${pad(result.score, 2)}</span>${result.name}`

                birdLi.appendChild(previewDiv)
                birdLi.appendChild(theirName)
                birds.appendChild(birdLi)
            })

            const preloadAssetsDone = () => {
                const goButton = document.getElementById("button")!
                const adID = livesExtensionsButtonToAdID(livesState)
                if (lives <= 0) {
                    prepareModalAd(adID)
                }

                goButton.onclick = () => {
                    const playGame = () => {
                        this.game.scene.remove(this)
                        const scene = new BattleScene({
                            seed: this.seed,
                            gameMode: GameMode.Trial,
                            theme: GameTheme.default,
                            data: emptySeedData
                        })
                        addScene(this.game, "BattleScene" + this.seed, scene, true, {})
                        scene.playBusCrash()
                    }

                    if (lives !== 0) {
                        playGame()
                        return
                    } else {
                        requestModalAd(adID)
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

        document.getElementById("back")!.onclick = () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }

        const info = document.getElementById("info")!
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

        /** Okay, hack ahoy.
         * We can't display a canvas-based Prompt on top of a DOM-based screen.
         * Sooo... let's immediately go back to the main menu before displaying it,
         * and then re-show the trial screen as soon as the user hits okay.
         */
        this.game.scene.remove(this)
        const bgScene = showBackgroundScene(this.game)

        const options = {
            title: `You've earned`,
            subtitle: `${livesToAdd} more tries!`,
            yes: "ok",

            completion: (response: boolean, prompt: Prompt) => {
                prompt.dismiss()
                bgScene.dismiss()
                const lobby = new TrialLobby({ seed: this.seed })
                addScene(this.game, "TrialLobby" + this.seed, lobby, true, {})
            }
        }
        showPrompt(options, this.game)

        const info = document.getElementById("info")!
        info.innerHTML = `Daily scoreboard<br />${livesToAdd} tries left`

        document.getElementById("button-text")!.textContent = "start"

        const goButton = document.getElementById("button")!
        goButton.onclick = () => {
            this.game.scene.remove(this)

            const scene = new BattleScene({
                seed: this.seed,
                gameMode: GameMode.Trial,
                data: emptySeedData
            })
            addScene(this.game, "BattleScene" + this.seed, scene, true, {})
            scene.playBusCrash()
        }
    }
}

function pad(n: any, width: any, z?: any) {
    z = z || "0"
    n = n + ""
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
