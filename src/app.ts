import * as Phaser from "phaser"

import * as constants from "./constants"
import { launchMainMenu } from "./menus/MainMenuScene"
import { emptySeedData, fetchRecordingsForSeed } from "./firebase"
import { BattleScene } from "./battle/Scene"
import { GameMode } from "./battle/utils/gameMode"
import * as appCache from "./appCache"
import { showLoadingScreen } from "./menus/LoadingScene"
import { UserSettingsKey, UserSettings } from "./menus/UserSettingsScene"
import { RoyaleLobby } from "./menus/RoyaleLobby"
import { TrialLobby } from "./menus/TrialLobby"

declare var PRODUCTION: boolean

// Ensures that webpack picks up the CSS
// and adds it to the HTML
require("../style.css")

if (PRODUCTION) {
    appCache.configure()
}

enum StartupScreen {
    MainMenu,
    RoyalBattle,
    TrialBattle,
    Settings,
    RoyaleLobby,
    TrialLobby
}

function newGame(): FlappyGame {
    const config: Phaser.Types.Core.GameConfig = {
        title: "Flappy Royale",
        width: constants.GameWidth,
        height: constants.GameHeight,
        parent: "game",
        backgroundColor: "#62CBE0",
        seed: ["consistent", "physics", "thanks"],
        scale: {
            mode: (screen.width < screen.height ?
                Phaser.Scale.WIDTH_CONTROLS_HEIGHT :
                Phaser.Scale.FIT),
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

    return new FlappyGame(config)
}


export class FlappyGame extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config)
    }
}

// The normal game flow

const loadUpIntoTraining = async (game: FlappyGame, settings: { offline: boolean; mode: GameMode }) => {
    let seed = "0-royale-1"
    let data = emptySeedData

    if (!settings.offline) {
        data = await fetchRecordingsForSeed(seed)
    }

    const scene = new BattleScene({ seed, data, gameMode: settings.mode })
    game.scene.add("Battle", scene, true)
}

const loadUpIntoSettings = (game: FlappyGame) => {
    const settings = new UserSettings()
    game.scene.add(UserSettingsKey, settings, true)
}

window.onload = async () => {
    constants.setDeviceSize()
    const game = newGame()

    const seed = "1-royale-0"

    // Change this to have it load up into a different screen on save
    const startupScreen = StartupScreen.MainMenu as StartupScreen

    switch (startupScreen) {
        case StartupScreen.TrialBattle:
            loadUpIntoTraining(game, { offline: false, mode: GameMode.Trial })
            break

        case StartupScreen.RoyalBattle:
            loadUpIntoTraining(game, { offline: false, mode: GameMode.Royale })
            break

        case StartupScreen.Settings:
            loadUpIntoSettings(game)
            break

        case StartupScreen.MainMenu:
            launchMainMenu(game)
            break

        case StartupScreen.RoyaleLobby:
            const lobby = new RoyaleLobby({ seed })
            game.scene.add("RoyaleLobby" + seed, lobby, true, {})
            break

        case StartupScreen.TrialLobby:
            const trial = new TrialLobby({ seed })
            game.scene.add("TrialLobby" + seed, trial, true, {})
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
