import * as Phaser from "phaser"

import * as constants from "./constants"
import { launchMainMenu } from "./menus/MainMenuScene"
import { emptySeedData, fetchRecordingsForSeed, PlayerData } from "./firebase"
import { BattleScene } from "./battle/Scene"
import { GameMode } from "./battle/utils/gameMode"
import * as appCache from "./appCache"
import { showLoadingScreen } from "./menus/LoadingScene"
import { UserSettingsKey, UserSettingsScene } from "./menus/UserSettingsScene"
import { RoyaleLobby } from "./menus/RoyaleLobby"
import { TrialLobby } from "./menus/TrialLobby"
import { addScene } from "./menus/utils/addScene"
import { TrialDeath } from "./battle/overlays/TrialDeathScene"
import { getUserSettings } from "./user/userManager"
import { GameTheme } from "./battle/theme"
import { wait } from "./battle/utils/wait"
import { AppLaunchScene } from "./menus/AppLaunchScreen"
import { launchTutorial } from "./battle/TutorialScene"
import { setupSentry } from "./setupSentry"
import { setupAdsense } from "./util/setupAdsense"
import { setupGAnalytics } from "./util/setupGAnalytics"
import { currentPlatform } from "./util/getPlatform"
import * as PlayFab from "./playFab"

declare const PRODUCTION: boolean
declare const DEMO: boolean

// Ensures that webpack picks up the CSS
// and adds it to the HTML
require("../style.css")
if (!PRODUCTION) {
    require("./setUpAppStoreScreenshots.ts")
}

if (PRODUCTION) {
    appCache.configure()
    setupSentry()

    if (currentPlatform === "web") {
        setupGAnalytics()
    }
}

if (DEMO) {
    document.body.className = "demo"
    // setupAdsense()
}

// TODO: Delete this line before shipping the production app
localStorage.setItem("beta", "true")

// ...and uncomment the following
/*
if (localStorage.getItem("beta") === "true") {
    localStorage.clear()
    window.location.reload()
}
*/

enum StartupScreen {
    Launcher,
    MainMenu,
    RoyalBattle,
    TrialBattle,
    Settings,
    RoyaleLobby,
    TrialLobby,
    Tutorial
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
            zoom: 4,
            autoCenter: Phaser.Scale.CENTER_BOTH
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

export const loadUpIntoTraining = async (game: FlappyGame, settings: { offline: boolean; mode: GameMode }) => {
    let seed = "0-royale-1"
    let data = emptySeedData

    if (!settings.offline) {
        data = await fetchRecordingsForSeed(seed)
    }

    const scene = new BattleScene({ seed, data, gameMode: settings.mode, theme: GameTheme.default })
    addScene(game, "Battle", scene, true)
    return scene
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
            lives: 10,
            livesState: 1,
            battle: {} as any,
            seed: this.seed,
            score: 5,
            isHighScore: false
        })

        game.scene.add("over", deathOverlay, true)
    }, 300)
}

export const loadUpIntoSettings = (game: Phaser.Game) => {
    const settings = new UserSettingsScene()
    addScene(game, UserSettingsKey, settings, true)
}

declare global {
    interface Window {
        currentGame: Phaser.Game
    }
}

if (!PRODUCTION) {
    console.log("Skipping app cache")
} else {
    appCache.onDownloadStart(() => {
        // TODO: Let's hooope there's a current game by the time this happens.
        // Otherwise, we'll need to be smarter here.
        // (Wrting this on 3 July 2019.
        // If you see this months later, we're fine and you can safely delete this comment :) )
        console.log("New version!")
        const launchScreen = window.currentGame.scene.getScene("Launch") as AppLaunchScene
        if (launchScreen) {
            launchScreen.showLoadingScreen = true
        } else {
            showLoadingScreen(window.currentGame)
        }
    })
}

window.onload = async () => {
    // This very silly delay fixes the issues where notch-detection code sometimes doesn't work properly.
    // TODO: Our splash screen can happen in not-Phaser DOM land and use that to mask this waiting period.
    await wait(100)

    PlayFab.login()

    constants.setDeviceSize()
    const game = newGame()

    // Fixes viewport if the user dismisses the iOS keyboard by tapping 'done'
    window.addEventListener("blur", () => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    })

    // @ts-ignore
    // This is used by Ads manager etc to get to our game
    window.currentGame = game

    const seed = "1-royale-0"

    // Change this to have it load up into a different screen on save in dev mode
    const startupScreen = StartupScreen.MainMenu as StartupScreen

    if (PRODUCTION) {
        if (localStorage.getItem("skipLaunchScreen") === "true") {
            localStorage.removeItem("skipLaunchScreen")
            launchMainMenu(game)
        } else {
            const scene = new AppLaunchScene()
            game.scene.add("launcher", scene, true)
        }
    } else {
        switch (startupScreen) {
            case StartupScreen.Launcher:
                const scene = new AppLaunchScene()
                game.scene.add("Launch", scene, true)
                break
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

            case StartupScreen.Tutorial:
                launchTutorial(game)
                break
        }

        // showLoadingScreen(game)
        // appCache.fakeLoadingScreen()
        // testTrialDeathScreen(game, 7)
    }
}
