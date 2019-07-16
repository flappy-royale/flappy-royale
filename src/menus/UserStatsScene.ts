import * as Phaser from "phaser"
import { getUserStatistics } from "../user/userManager"
import { GameWidth, GameHeight } from "../constants"
import { launchMainMenu } from "./MainMenuScene"
import { resizeToFullScreen } from "./utils/resizeToFullScreen"
import { preloadBackgroundBlobImages, setupBackgroundBlobImages } from "./utils/backgroundColors"

export const UserStatsKey = "UserStatsKey"

export class UserStatsScene extends Phaser.Scene {
    constructor() {
        super(UserStatsKey)
    }

    preload() {
        // Adds the HTML file to the game cache
        this.load.html("Stats", require("../../assets/html/Stats.html"))
        this.load.image("back-button", require("../../assets/menu/Back2.png"))
        this.load.image("bottom-sash", require("../../assets/menu/BottomSash.png"))

        preloadBackgroundBlobImages(this)
    }

    create() {
        // Fill the BG
        this.add.rectangle(GameWidth / 2, GameHeight / 2, GameWidth, GameHeight, 0xdecf5e)
        setupBackgroundBlobImages(this, { min: 30 })

        // Make a HTML form
        var element = this.add
            .dom(0, 0)
            .setOrigin(0, 0)
            .createFromCache("Stats")
        resizeToFullScreen(element)
        element.addListener("click")

        // Sets up the stats which lives under the settings
        setUpStatsHTML()

        const header = document.getElementById("header") as HTMLImageElement
        header.src = require("../../assets/menu/RedSash.png")
        const footer = document.getElementById("footer") as HTMLImageElement
        footer.src = require("../../assets/menu/BottomSash.png")

        const back = document.getElementById("back") as HTMLImageElement
        back.src = require("../../assets/menu/Back2.png")

        back.onclick = () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        }
    }
}

function setUpStatsHTML() {
    const statsElement = document.getElementById("stats")!
    const stats = getUserStatistics()

    let seconds = Math.floor(stats.totalTime / 1000)
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)
    let days = Math.floor(hours / 24)

    hours = hours - days * 24
    minutes = minutes - days * 24 * 60 - hours * 60
    seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60

    const time = [days, hours, minutes, seconds].filter(d => !!d)
    const postThing = time.length == 1 ? "s" : ""

    // User facing names for the stats
    const presentation = {
        "Royale Streak": stats.royaleStreak,
        "Best Streak": stats.bestRoyaleStreak,
        "Royale Wins": stats.royaleWins,
        "Best Position": stats.bestPosition,
        "Top Score": stats.bestScore,
        "Games Played": stats.gamesPlayed,
        "First Pipe fails": stats.instaDeaths,
        "Birds Passed": stats.birdsBeaten,
        "Play Time": `${time.join(":")}${postThing}`,
        Flaps: stats.totalFlaps,
        "Score History": ""
    }

    // Show either top position or royale wins
    if (stats.bestRoyaleStreak === 0) {
        delete presentation["Best Streak"]
        delete presentation["Royale Streak"]
    }

    if (stats.royaleWins === 0) delete presentation["Royale Wins"]
    if (stats.bestPosition === 0) delete presentation["Best Position"]
    if (stats.bestPosition === 500) delete presentation["Best Position"] // not played a game

    // convert ^ to HTML
    Object.keys(presentation).forEach(key => {
        // @ts-ignore
        const value = presentation[key]
        const dataDiv = document.createElement("p")
        dataDiv.innerHTML = `${key}<span>${value}</span>`
        statsElement.appendChild(dataDiv)
        statsElement.appendChild(document.createElement("hr"))
    })

    const runs = stats.scoreHistory
    const runsContainer = document.getElementById("runs-graph")!

    const topScore = document.createElement("div")
    topScore.id = "top-score"
    topScore.textContent = stats.bestScore.toString()
    runsContainer.appendChild(topScore)

    const bottomScore = document.createElement("div")
    bottomScore.id = "bottom-score"
    bottomScore.textContent = "0" //stats.bestScore.toString()
    runsContainer.appendChild(bottomScore)

    // Graph constraints
    // we have 130 px max, must divide rows into round numbers, can be less than 130 columns
    // can't drop the highest
    // Let's be nice and overly optimistic.
    //
    let r = runs
    const maxLength = Math.min(130, r.length)
    for (let i = 0; i < maxLength; i++) {
        const index = r.length < 130 ? i : Math.round((runs.length / 130) * i)
        const run = r[index]

        const height = 60 / stats.bestScore
        const relativeHeight = (run && Math.round(height * run)) || 0
        console.log(height)
        const bottomScore = document.createElement("div")
        bottomScore.className = "column"
        bottomScore.style.left = `${14 + i}px`
        bottomScore.style.height = `${relativeHeight + 1}px`
        runsContainer.appendChild(bottomScore)
    }
}
