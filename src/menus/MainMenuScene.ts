import * as Phaser from "phaser"
import { UserSettingsScene, UserSettingsKey } from "./UserSettingsScene"
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

declare const DEMO: boolean

/** Used on launch, and when you go back to the main menu */
export const launchMainMenu = (game: Phaser.Game) => {
    const mainMenu = new MainMenuScene()
    addScene(game, "MainMenu", mainMenu, true)
}

export class MainMenuScene extends Phaser.Scene {
    seeds: SeedsResponse
    battleBG: BattleScene

    playerNameText: Phaser.GameObjects.BitmapText
    winsLabel: Phaser.GameObjects.BitmapText

    constructor() {
        super("MainMenu")
    }

    preload() {
        this.load.image("logo", require("../../assets/menu/logo.png"))
        this.load.image("royale-button", require("../../assets/menu/royale-2.png"))
        this.load.image("trial-button", require("../../assets/menu/trial-2.png"))
        this.load.image("settings-button", require("../../assets/menu/settings-2.png"))
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

        if (hasName()) {
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
            this.seeds = seeds
        })

        const settings = getUserSettings()

        const player = new BirdSprite(this, 6, c.GameHeight - 12, { isPlayer: false, settings: settings })
        player.actAsImage()
        player.makeClickable(this.loadSettings, this)
        this.playerNameText = this.add.bitmapText(26, c.GameHeight - 20, "nokia16", settings.name, 0)
        becomeButton(this.playerNameText, this.loadSettings, this)

        const royaleButton = this.add.image(84, 110 + c.NotchOffset, "royale-button")
        becomeButton(royaleButton, this.loadRoyale, this)

        const trial = this.add.image(74, 152 + c.NotchOffset, "trial-button")
        if (!DEMO) {
            becomeButton(trial, this.loadTrial, this)
        } else {
            trial.setAlpha(0.3)
        }

        const settingsButton = this.add.image(76, c.GameHeight - 40, "settings-button")
        becomeButton(settingsButton, this.loadSettings, this)

        const howToPlayButton = this.add.bitmapText(0, c.GameHeight - 40, "nokia16", "?", 20)
        rightAlignTextLabel(howToPlayButton, 10)
        becomeButton(howToPlayButton, this.loadTutorial, this)
    }
    private loadSettings() {
        this.removeMenu()
        const settings = new UserSettingsScene()
        addScene(this.game, UserSettingsKey, settings, true)
    }

    private loadTutorialFlow() {
        const options = {
            title: "Welcome!",
            subtitle: "have you played\nFlappy Bird before?",

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
        const namePrompt = new EnterNameScreen(() => {
            this.scene.remove(namePrompt)
            this.loadAttirePrompt()
        })
        addScene(this.game, NamePromptKey, namePrompt, true)
    }

    private loadAttirePrompt() {
        const options = {
            title: "Flap in Fashion!",
            subtitle: "customize your bird?",

            yes: "YEAH!",
            no: "LATER",

            y: (2 / 5) * c.GameHeight,

            completion: (response: boolean, prompt: Prompt) => {
                this.scene.remove(prompt)
                if (response) {
                    this.loadSettings()
                } else {
                    this.setUpMenu()
                }
            }
        }

        showPrompt(options, this.game)
    }

    private loadTrial() {
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

    private loadTutorial() {
        this.removeMenu()
        launchTutorial(this.game)
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
