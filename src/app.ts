import * as Phaser from "phaser"

import * as constants from "./constants"
import { launchMainMenu } from "./menus/MainMenuScene"
import { getSeedsFromAPI, emptySeedData } from "./firebase"
import { BattleScene } from "./battle/Scene"
import { GameMode } from "./battle/utils/gameMode"
import * as appCache from "./appCache"
import { showLoadingScreen } from "./menus/LoadingScene"
import { UserSettingsKey, UserSettings } from "./menus/UserSettingsScene"

declare var PRODUCTION: boolean

// Ensures that webpack picks up the CSS
// and adds it to the HTML
require("../style.css")

if (PRODUCTION) {
    appCache.configure()
}

enum StartupScreen {
    MainMenu,
    Battle,
    Settings
}

// Change this to have it load up into a different screen on save
const startupScreen = StartupScreen.MainMenu as StartupScreen

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
const game = new FlappyGame(config)

// The normal game flow

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
    game.scene.add("Battle", scene, true)
}

const loadUpIntoSettings = () => {
    const settings = new UserSettings()
    game.scene.add(UserSettingsKey, settings, true)
}

window.onload = async () => {
    switch (startupScreen) {
        case StartupScreen.Battle:
            loadUpIntoTraining({ offline: true })
            break

        case StartupScreen.Settings:
            loadUpIntoSettings()
            break

        case StartupScreen.MainMenu:
            launchMainMenu(game)
            break
    }

    // appCache.fakeLoadingScreen()

    if (!PRODUCTION) {
        console.log("Skipping app cache")
    } else {
        appCache.onDownloadStart(() => {
            console.log("New version!")
            showLoadingScreen(game)
        })
    }
}
