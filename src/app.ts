import * as Phaser from "phaser"

import { FirebaseDataStore, getSeedsFromAPI } from "./firebase"

import * as constants from "./constants"
import { MainMenuScene } from "./menus/MainMenuScene"

// Ensures that webpack picks up the CSS
// and adds it to the HTML
require("../style.css")

const config: Phaser.Types.Core.GameConfig = {
    title: "Flappy",
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
            debug: false,
            gravity: {
                y: constants.gravity
            }
        }
    },
    render: {
        pixelArt: true,
        antialias: false
    }
}

export class FlappyGame extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config)
    }
}

window.onload = async () => {
    // const scene = new BattleScene({ seed: seeds.royale.production })
    const mainMenu = new MainMenuScene()
    // const settings = new UserSettings()
    const game = new FlappyGame(config)
    game.scene.add("MainMenu", mainMenu, true)
    // game.scene.add("GameScene", scene, true, firebase)
}
