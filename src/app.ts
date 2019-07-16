import * as Phaser from "phaser"

import * as constants from "./constants"
import { launchMainMenu } from "./menus/MainMenuScene"
import { emptySeedData, fetchRecordingsForSeed } from "./firebase"

import { BattleScene } from "./battle/Scene"
import { GameMode } from "./battle/utils/gameMode"
import * as appCache from "./appCache"
import { showLoadingScreen } from "./menus/LoadingScene"
import { YouKey, YouScene } from "./menus/YouScene"
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
import { setupGAnalytics } from "./util/setupGAnalytics"
import { currentPlatform } from "./util/getPlatform"
import * as PlayFab from "./playFab"
import { setUpScreenTracking } from "./screenTimeTracker"
import { AppSettingsScene } from "./menus/AppSettingsScene"
import { versionIsCurrent, downloadURL } from "./detectVersion"
import { isAndroidApp } from "./nativeComms/deviceDetection"
import { Prompt, showPrompt } from "./menus/Prompt"
import { showBackgroundScene } from "./menus/BackgroundScene"
import { PlayerData } from "./firebaseTypes"

declare const PRODUCTION: boolean
declare const DEMO: boolean

let showLoadingScreenOnLaunch = false

// Ensures that webpack picks up the CSS
// and adds it to the HTML
require("../style.css")
if (!PRODUCTION) {
    require("./setUpAppStoreScreenshots.ts")
}

if (PRODUCTION) {
    appCache.configure()

    appCache.onDownloadProgress((percent: number) => {
        // onDownloadEnd isn't 100% reliable
        // so this is a backup, where it'll call it with a bit of a delay
        // https://github.com/lazerwalker/flappy-royale/issues/102
        if (percent === 1) {
            setTimeout(() => {
                localStorage.setItem("skipLaunchScreen", "true")
                window.location.reload()
            }, 300)
        }
    })

    appCache.onDownloadEnd(() => {
        localStorage.setItem("skipLaunchScreen", "true")
        window.location.reload()
    })

    setupSentry()

    if (currentPlatform === "web") {
        setupGAnalytics()
    }
}

if (DEMO) {
    document.body.className = "demo"
    // setupAdsense()
}

if (localStorage.getItem("beta") === "true") {
    localStorage.clear()
    window.location.reload()
}

enum StartupScreen {
    Launcher,
    MainMenu,
    RoyalBattle,
    TrialBattle,
    Settings,
    Attire,
    RoyaleLobby,
    TrialLobby,
    Tutorial
}

function newGame(): FlappyGame {
    const isSafariRenderer = window.isAppleApp || "safari" in window
    const renderMode = isSafariRenderer ? Phaser.CANVAS : Phaser.AUTO

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
        type: renderMode,
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
    let seed = "1-royale-1"
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
            seed: "123",
            score: 5,
            isHighScore: false
        })

        game.scene.add("over", deathOverlay, true)
    }, 300)
}

export const loadUpIntoSettings = (game: Phaser.Game) => {
    const settings = new AppSettingsScene()
    addScene(game, YouKey, settings, true)
}

const loadUpIntoAttire = (game: Phaser.Game) => {
    const settings = new YouScene()
    addScene(game, YouKey, settings, true)
}

declare global {
    interface Window {
        currentGame: Phaser.Game
    }
}

window.addEventListener("fake-visibilitychange", (e: any) => {
    const hidden = e.detail.hidden
    const state = hidden ? "hidden" : "visible"

    // document.hidden is read-only. This is necessary to properly set it!
    // via https://sqa.stackexchange.com/questions/32152/force-a-browsers-visibility-setting-to-true
    Object.defineProperty(document, "visibilityState", { value: state, writable: true })
    Object.defineProperty(document, "hidden", { value: hidden, writable: true })
    document.dispatchEvent(new Event("visibilitychange"))
})

// If the user last minimized/closed the app > 5 minutes ago, but their OS didn't trigger an app nrestart,
// let's force them to reload the game so they can check for app updates
window.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        window.dateLastHidden = new Date()
    } else if (window.dateLastHidden) {
        const now = new Date()
        const msSinceLastOpen = now.getTime() - window.dateLastHidden.getTime()

        if (msSinceLastOpen > 5 * 60 * 1000) {
            window.location.reload()
        }
    }
})

// Tell Android to dismiss the splash screen
window.addEventListener(
    "gameloaded",
    () => {
        if (window.LoadingManager) {
            window.LoadingManager.gameLoaded()
        }
    },
    { once: true }
)

if (!PRODUCTION) {
    console.log("Skipping app cache")
} else {
    appCache.onDownloadStart(() => {
        console.log("New version!")

        // If the game hasn't gotten set up yet, let's set a flag to immediately do the right thing once it does load.
        if (!window.currentGame) {
            showLoadingScreenOnLaunch = true
            return
        }

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

    // Android doesn't give us an easy way to set variables on window.
    // This AndroidStaticData.fetch() function is going to return a JSON object
    // containing everything we want shoved onto window.
    if (window.AndroidStaticData) {
        let data = JSON.parse(window.AndroidStaticData.fetch())
        for (const key in data) {
            // @ts-ignore
            window[key] = data[key]
        }
    }

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

    setUpScreenTracking()

    const seed = "1-royale-0"

    if (!versionIsCurrent()) {
        showBackgroundScene(game)

        const options = {
            title: "New Version Available!",
            subtitle: "Please update to play.",
            yes: "GET",

            completion: (_: any, prompt: Prompt) => {
                if (isAndroidApp() && window.URLLoader) {
                    if (window.URLLoader.openPlayStoreURL) window.URLLoader.openPlayStoreURL(downloadURL())
                } else {
                    window.open(downloadURL())
                }
            }
        }
        setTimeout(() => {
            showPrompt(options, game)
        }, 1000)
        return
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Change this to have it load up into a different screen on save in dev mode
    const startupScreen = StartupScreen.MainMenu as StartupScreen

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                if (showLoadingScreenOnLaunch) {
                    scene.showLoadingScreen = true
                }
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

            case StartupScreen.Attire:
                loadUpIntoAttire(game)
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
