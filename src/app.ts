import * as Phaser from "phaser"

import * as constants from "./constants"
import { MainMenuScene, launchMainMenu } from "./menus/MainMenuScene"
import { getSeedsFromAPI, emptySeedData } from "./firebase"
import { BattleScene } from "./battle/Scene"
import { GameMode } from "./battle/utils/gameMode"

// Ensures that webpack picks up the CSS
// and adds it to the HTML
require("../style.css")

const config: Phaser.Types.Core.GameConfig = {
    title: "Flappy Royale",
    width: constants.GameWidth,
    height: constants.GameHeight,
    parent: "game",
    backgroundColor: "#62CBE0",
    seed: ["consistent", "physics", "thanks"],
    scale: {
        mode: Phaser.Scale.FIT,
        parent: "game",
        width: constants.GameWidth,
        height: constants.GameHeight,
        zoom: 4
    },
    dom: {
        createContainer: true
    },
    type: Phaser.CANVAS,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: constants.gravity
            }
        }
    },
    render: {
        pixelArt: true
    }
}

export class FlappyGame extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config)
    }
}

// The normal game flow

const loadUpMainMenu = () => {
    const game = new FlappyGame(config)
    launchMainMenu(game)
}

const loadUpIntoTraining = async (settings: { offline: boolean }) => {
    let seed = "offline-seed"
    if (!settings.offline) {
        try {
            const seeds = await getSeedsFromAPI(constants.APIVersion)
            seed = seeds.daily.production
        } catch (error) {
            // NOOP
        }
    }

    const scene = new BattleScene({ seed, data: emptySeedData, gameMode: GameMode.Training })
    const game = new FlappyGame(config)
    game.scene.add("Battle", scene, true)
}

window.onload = async () => {
    loadUpMainMenu()

    // loadUpIntoTraining({ offline: true })
}
