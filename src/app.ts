import * as Phaser from "phaser"

import { FirebaseDataStore } from "./firebase"
import { BattleScene } from "./battle/Scene"
// import { UserSettings } from "./menus/UserSettingsScene"

import * as constants from "./constants"

// Ensures that webpack picks up the CSS
// and adds it to the HTML
require("../style.css")

const config: Phaser.Types.Core.GameConfig = {
    title: "Flappy",
    width: 160,
    height: 240,
    parent: "game",
    backgroundColor: "#62CBE0",
    seed: ["consistent", "physics", "thanks"],
    scale: {
        mode: Phaser.Scale.FIT,
        parent: "game",
        width: 160,
        height: 240,
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
    const firebase = new FirebaseDataStore(constants.APIVersion)
    const seed = constants.dailySeed()
    await firebase.fetch(seed)

    const scene = new BattleScene({ seed: seed })
    // const settings = new UserSettings()
    const game = new FlappyGame(config)
    game.scene.add("GameScene", scene, true, firebase)
}
