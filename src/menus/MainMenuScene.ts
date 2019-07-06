import * as Phaser from "phaser"
import { UserAttireScene, UserAttireKey } from "./UserAttireScene"
import { emptySeedData, getSeeds } from "../firebase"
import { BattleScene } from "../battle/Scene"
import * as c from "../constants"
import { GameMode } from "../battle/utils/gameMode"
import { SeedsResponse } from "../../functions/src/api-contracts"
import { TrialLobby } from "./TrialLobby"
import { RoyaleLobby } from "./RoyaleLobby"
import {
    getAndBumpUserCycleSeedIndex,
    getUserSettings,
    getUserStatistics,
    hasAskedAboutTutorial,
    hasName
} from "../user/userManager"
import { preloadBackgroundBlobImages, setupBackgroundBlobImages } from "./utils/backgroundColors"
import { preloadBirdSprites, BirdSprite } from "../battle/BirdSprite"
import { becomeButton } from "./utils/becomeButton"
import { defer } from "lodash"
import { addScene } from "./utils/addScene"
import { GameTheme } from "../battle/theme"
import { rightAlignTextLabel } from "../battle/utils/alignTextLabel"
import { launchTutorial } from "../battle/TutorialScene"
import { EnterNameScreen, NamePromptKey } from "./EnterNameScreen"
import { Prompt, showPrompt } from "./Prompt"
import { UserStatsScene, UserStatsKey } from "./UserStatsScene"
import { AppSettingsScene, AppSettingsKey } from "./AppSettingsScene"

declare const DEMO: boolean

/** Used on launch, and when you go back to the main menu */
export const launchMainMenu = (game: Phaser.Game, skipUI: boolean = false): MainMenuScene => {
    const mainMenu = new MainMenuScene(skipUI)
    addScene(game, "MainMenu", mainMenu, true)
    return mainMenu
}

export class MainMenuScene extends Phaser.Scene {
    seeds: SeedsResponse
    battleBG: BattleScene

    playerNameText: Phaser.GameObjects.BitmapText
    winsLabel: Phaser.GameObjects.BitmapText

    skipUI: boolean

    constructor(skipUI: boolean = false) {
        super("MainMenu")
        this.skipUI = skipUI
    }

    preload() {
        this.load.image("logo", require("../../assets/menu/logo.png"))
        this.load.image("royale-button", require("../../assets/menu/royale-2.png"))
        this.load.image("trial-button", require("../../assets/menu/trial-2.png"))
        this.load.image("settings-button", require("../../assets/menu/settings-2.png"))
        this.load.image("question-mark", require("../../assets/menu/question-mark.png"))
        this.load.image("stats-button", require("../../assets/menu/stats.png"))
        this.load.image("you-button", require("../../assets/menu/you.png"))

        preloadBackgroundBlobImages(this)
        preloadBirdSprites(this)

        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )
    }

    create() {
        // To make sure we clean up after ourselves
        const existingScenes = this.game.scene.scenes
        if (existingScenes.length > 1) {
            console.error("Too many scenes when creating a menu, you might be leaking scenes!")
            console.error("Scenes:", existingScenes)
        }

        this.battleBG = new BattleScene({
            key: "menu-bg",
            seed: "menu",
            data: emptySeedData,
            gameMode: GameMode.Menu,
            theme: GameTheme.default
        })
        addScene(this.game, "battlebg", this.battleBG, true)
        this.game.scene.bringToTop("MainMenu")

        // Fill the BG
        this.add.rectangle(c.GameWidth / 2, c.GameHeight / 2, c.GameWidth, c.GameHeight, 0x000000, 0.4)

        const logo = this.add.image(84, 50 + c.NotchOffset, "logo")
        becomeButton(logo, this.loadRoyale, this)

        setupBackgroundBlobImages(this, { min: 100 + c.NotchOffset, allColors: true })

        const settings = getUserSettings()

        if (this.skipUI) {
            // Do nothing!
        } else if (hasName()) {
            this.setUpMenu()
        } else if (!settings.hasAskedAboutTutorial) {
            this.loadTutorialFlow()
        } else {
            this.loadNamePrompt()
        }

        // This is just used for taking snapshots
        window.dispatchEvent(new Event("gameloaded"))
    }

    private setUpMenu() {
        const stats = getUserStatistics()

        if (stats.royaleStreak > 0) {
            this.winsLabel = this.add.bitmapText(
                c.GameWidth,
                c.NotchOffset,
                "nokia16",
                "streak: " + stats.royaleStreak,
                0
            )
        } else {
            this.winsLabel = this.add.bitmapText(c.GameWidth, c.NotchOffset, "nokia16", "wins: " + stats.royaleWins, 0)
        }
        rightAlignTextLabel(this.winsLabel, 3)

        // NOTE: ASYNC!
        getSeeds(c.APIVersion).then(seeds => {
            if (seeds) this.seeds = seeds
        })

        const settings = getUserSettings()

        const royaleButton = this.add.image(84, 110 + c.NotchOffset, "royale-button")
        becomeButton(royaleButton, this.loadRoyale, this)

        const trial = this.add.image(74, 152 + c.NotchOffset, "trial-button")
        if (!DEMO) {
            becomeButton(trial, this.loadTrial, this)
        } else {
            trial.setAlpha(0.3)
        }

        const settingsButton = this.add.image(c.GameWidth - 20, c.GameHeight - 21, "settings-button")
        becomeButton(settingsButton, this.loadSettings, this)

        const youButton = this.add.image(32, c.GameHeight - 22, "you-button")

        const player = new BirdSprite(this, 8, c.GameHeight - 22, {
            isPlayer: false,
            isImage: true,
            settings: settings
        })
        becomeButton(youButton, this.loadYourAttire, this)

        const statsButton = this.add.image(c.GameWidth / 2 + 10, c.GameHeight - 22, "stats-button")
        becomeButton(statsButton, this.loadStats, this)

        // const howToPlayButton = this.add.image(c.GameWidth - 12, c.GameHeight - 42, "question-mark")
        // becomeButton(howToPlayButton, this.loadTutorial, this)
    }

    loadSettings() {
        this.removeMenu()
        const settings = new AppSettingsScene()
        addScene(this.game, AppSettingsKey, settings, true)
    }

    private loadYourAttire() {
        this.removeMenu()
        const settings = new UserAttireScene()
        addScene(this.game, UserAttireKey, settings, true)
    }

    private loadStats() {
        this.removeMenu()
        const settings = new UserStatsScene()
        addScene(this.game, UserStatsKey, settings, true)
    }

    private loadTutorialFlow() {
        const options = {
            title: "",
            subtitle: "Have you played a\nflappy game before?",

            // TODO: Lol, these should be called primary/secondary
            yes: "NOPE!",
            no: "YES",

            y: (1 / 3) * c.GameHeight,

            completion: (response: boolean, prompt: Prompt) => {
                hasAskedAboutTutorial()
                this.scene.remove(prompt)
                if (response) {
                    this.removeMenu()
                    launchTutorial(this.game)
                } else {
                    if (!hasName()) {
                        this.loadNamePrompt()
                    } else {
                        this.setUpMenu()
                    }
                }
            }
        }

        showPrompt(options, this.game)
    }

    private loadNamePrompt() {
        const namePrompt = new EnterNameScreen(false, () => {
            this.scene.remove(namePrompt)
            this.loadAttirePrompt()
        })
        addScene(this.game, NamePromptKey, namePrompt, true)
    }

    private loadAttirePrompt() {
        const options = {
            title: "Flap in Fashion!",
            subtitle: "Customize your bird?",

            yes: "YEAH!",
            no: "LATER",

            y: (2 / 5) * c.GameHeight,

            completion: (response: boolean, prompt: Prompt) => {
                this.scene.remove(prompt)
                if (response) {
                    this.loadYourAttire()
                } else {
                    this.setUpMenu()
                }
            }
        }

        showPrompt(options, this.game)
    }

    loadTrial() {
        this.removeMenu()
        const seed = this.seeds.daily.production
        const lobby = new TrialLobby({ seed })
        addScene(this.game, "TrialLobby" + seed, lobby, true, {})
    }

    private loadRoyale() {
        this.removeMenu()
        const index = getAndBumpUserCycleSeedIndex(this.seeds.royale.length)
        const seed = this.seeds.royale[index]
        const lobby = new RoyaleLobby({ seed })
        addScene(this.game, "RoyaleLobby" + seed, lobby, true, {})
    }

    removeMenu() {
        // We get a JS error if we just remove the scene before the new scene has started (finished?) loading
        // Phaser's docs claim scene.remove() will process the operation, but that seems to not be the case
        // Manually pushing the remove action til the next update loop seems to fix it /shrug
        defer(() => {
            this.game.scene.remove(this)
            this.game.scene.remove(this.battleBG)
        })
    }
}
