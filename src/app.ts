import * as Phaser from "phaser"

import * as constants from "./constants"
import { launchMainMenu } from "./menus/MainMenuScene"
import { emptySeedData, fetchRecordingsForSeed, PlayerData } from "./firebase"
import { BattleScene } from "./battle/Scene"
import { GameMode } from "./battle/utils/gameMode"
import * as appCache from "./appCache"
import { showLoadingScreen } from "./menus/LoadingScene"
import { UserSettingsKey, UserSettings } from "./menus/UserSettingsScene"
import { RoyaleLobby } from "./menus/RoyaleLobby"
import { TrialLobby } from "./menus/TrialLobby"
import { addScene } from "./menus/utils/addScene"
import { TrialDeath } from "./battle/overlays/TrialDeathScene"
import { getUserSettings } from "./user/userManager"
import { GameTheme } from "./battle/theme"

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
            mode: screen.width < screen.height ? Phaser.Scale.WIDTH_CONTROLS_HEIGHT : Phaser.Scale.FIT,
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

    adsHaveBeenUnlocked() {
        const adUnlocker = this.scene.scenes.find(s => !!s.adsHaveBeenUnlocked)
        if (adUnlocker) {
            adUnlocker.adsHaveBeenUnlocked()
        }
    }
}

// The normal game flow

const loadUpIntoTraining = async (game: FlappyGame, settings: { offline: boolean; mode: GameMode }) => {
    let seed = "0-royale-1"
    let data = emptySeedData

    if (!settings.offline) {
        data = await fetchRecordingsForSeed(seed)
    }

    const scene = new BattleScene({ seed, data, gameMode: settings.mode, theme: GameTheme.default })
    addScene(game, "Battle", scene, true)
}

const testTrialDeathScreen = (game: FlappyGame, position: number) => {
    setTimeout(() => {
        const one: PlayerData = {
            score: 334,
            actions: [],
            timestamp: 0,
            user: getUserSettings()
        }

        const two: PlayerData = {
            score: 21,
            actions: [],
            timestamp: 0,
            user: getUserSettings()
        }

        const three: PlayerData = {
            score: 22,
            actions: [],
            timestamp: 0,
            user: getUserSettings()
        }

        const four: PlayerData = {
            score: 22,
            actions: [],
            timestamp: 0,
            user: getUserSettings()
        }

        const five: PlayerData = {
            score: 22,
            actions: [],
            timestamp: 0,
            user: getUserSettings()
        }

        const six: PlayerData = {
            score: 22,
            actions: [],
            timestamp: 0,
            user: getUserSettings()
        }

        const seven: PlayerData = {
            score: 22,
            actions: [],
            timestamp: 0,
            user: getUserSettings()
        }

        const deathOverlay = new TrialDeath("death", {
            score: 20,
            lives: 10,
            livesState: 1,
            position,
            battle: {} as any,
            totalPlayers: 128,
            seed: this.seed,
            replays: [one, two, three, four, five, six, seven]
        })

        game.scene.add("over", deathOverlay, true)
    }, 300)
}

const loadUpIntoSettings = (game: FlappyGame) => {
    const settings = new UserSettings()
    addScene(game, UserSettingsKey, settings, true)
}

const wait = async (delay: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), delay)
    })
}

window.onload = async () => {
    // This very silly delay fixes the issues where notch-detection code sometimes doesn't work properly.
    // TODO: Our splash screen can happen in not-Phaser DOM land and use that to mask this waiting period.
    await wait(100)

    constants.setDeviceSize()
    const game = newGame()

    // @ts-ignore
    // This is used by Ads manager etc to get to our game
    window.currentGame = game

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
            addScene(game, "RoyaleLobby" + seed, lobby, true, {})
            break

        case StartupScreen.TrialLobby:
            const trial = new TrialLobby({ seed })
            addScene(game, "TrialLobby" + seed, trial, true, {})
            break
    }

    // appCache.fakeLoadingScreen()
    // testTrialDeathScreen(game, 1)

    if (!PRODUCTION) {
        console.log("Skipping app cache")
    } else {
        appCache.onDownloadStart(() => {
            console.log("New version!")
            showLoadingScreen(game)
        })
    }
}
