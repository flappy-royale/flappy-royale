import * as Phaser from "phaser"
import { YouScene, YouKey } from "./YouScene"
import { getSeeds } from "../firebase"
import * as c from "../constants"
import { SeedsResponse } from "../../functions/src/api-contracts"
import { TrialLobby } from "./TrialLobby"
import { RoyaleLobby } from "./RoyaleLobby"
import {
    getAndBumpUserCycleSeedIndex,
    getUserSettings,
    getUserStatistics,
    hasAskedAboutTutorial,
    hasName,
    getSyncedUserSettings
} from "../user/userManager"
import { UserSettings } from "../user/UserSettingsTypes"
import { preloadBackgroundBlobImages } from "./utils/backgroundColors"
import { preloadBirdSprites, BirdSprite } from "../battle/BirdSprite"
import { becomeButton } from "./utils/becomeButton"
import { defer } from "lodash"
import { addScene } from "./utils/addScene"
import { rightAlignTextLabel } from "../battle/utils/alignTextLabel"
import { launchTutorial } from "../battle/TutorialScene"
import { EnterNameScreen, NamePromptKey } from "./EnterNameScreen"
import { Prompt, showPrompt } from "./Prompt"
import { UserStatsScene, UserStatsKey } from "./UserStatsScene"
import { AppSettingsScene, AppSettingsKey } from "./AppSettingsScene"
import { checkToShowRatingPrompt } from "../util/checkToShowRating"
import { BackgroundScene, showBackgroundScene } from "./BackgroundScene"
import { NewEggFoundScene } from "./NewEggFoundScene"
import { loginPromise, fetchLatestPlayerInfo } from "../playFab"
import { showDemoScene } from "./DemoScene"

declare const DEMO: boolean

/** Used on launch, and when you go back to the main menu */
export const launchMainMenu = (game: Phaser.Game): MainMenuScene => {
    const mainMenu = new MainMenuScene()
    addScene(game, "MainMenu", mainMenu, true)
    return mainMenu
}

export class MainMenuScene extends Phaser.Scene {
    seeds: SeedsResponse | undefined
    battleBG!: BackgroundScene

    playerNameText!: Phaser.GameObjects.BitmapText
    winsLabel!: Phaser.GameObjects.BitmapText

    eggButton: Phaser.GameObjects.Image | undefined
    playerIcon!: BirdSprite

    constructor() {
        super("MainMenu")
    }

    preload() {
        this.load.image("logo", require("../../assets/menu/logo.png"))
        this.load.image("royale-button", require("../../assets/menu/royale-2.png"))
        this.load.image("trial-button", require("../../assets/menu/trial-2.png"))
        this.load.image("settings-button", require("../../assets/menu/settings-2.png"))
        this.load.image("question-mark", require("../../assets/menu/question-mark.png"))
        this.load.image("stats-button", require("../../assets/menu/stats.png"))
        this.load.image("you-button", require("../../assets/menu/you.png"))
        this.load.image("demo-button", require("../../assets/menu/demo.png"))

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

        this.battleBG = showBackgroundScene(this.game)
        this.game.scene.bringToTop("MainMenu")

        becomeButton(this.battleBG.logo, this.loadRoyale, this)

        this.setUpMenu()

        // After the user has logged in, we decide whether to show onboarding.
        // If there's no internet access, we fall back to localStorage settings
        getSyncedUserSettings()
            .then(this.showOnboardingIfAppropriate)
            .catch(() => {
                const settings = getUserSettings()
                this.showOnboardingIfAppropriate(settings)
            })

        loginPromise
            .then(() => {
                return fetchLatestPlayerInfo()
            })
            .then(() => {
                // Replace UI elements that may have changed in response to new server data
                const stats = getUserStatistics()
                if (stats.royaleStreak > 0) {
                    this.winsLabel.setText(`streak: ${stats.royaleStreak}`)
                } else {
                    this.winsLabel.setText(`wins: ${stats.royaleWins}`)
                }
                rightAlignTextLabel(this.winsLabel, 3)
            })

        // This is just used for taking snapshots
        window.dispatchEvent(new Event("gameloaded"))
    }

    private showOnboardingIfAppropriate = (settings: UserSettings) => {
        if (hasName()) {
            return
        }

        if (!settings.hasAskedAboutTutorial) {
            this.loadTutorialFlow()
        } else {
            this.loadNamePrompt()
        }
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
            else console.log("!!!")
        })

        const settings = getUserSettings()

        if (DEMO) {
            const demoButton = this.add.image(116, 80 + c.NotchOffset, "demo-button")
            becomeButton(demoButton, this.showDemoInfo, this)
        }

        const royaleButton = this.add.image(84, 110 + c.NotchOffset, "royale-button")
        becomeButton(royaleButton, this.loadRoyale, this)

        const trial = this.add.image(74, 152 + c.NotchOffset, "trial-button")
        becomeButton(trial, this.loadTrial, this)

        const settingsButton = this.add.image(c.GameWidth - 20, c.GameHeight - 21, "settings-button")
        becomeButton(settingsButton, this.loadSettings, this)

        const youButton = this.add.image(32, c.GameHeight - 22, "you-button")

        this.playerIcon = new BirdSprite(this, 14, c.GameHeight - 22, {
            isPlayer: false,
            isImage: true,
            settings: settings
        })
        becomeButton(youButton, this.loadYourAttire, this)

        const statsButton = this.add.image(c.GameWidth / 2 + 10, c.GameHeight - 22, "stats-button")
        becomeButton(statsButton, this.loadStats, this)

        checkToShowRatingPrompt()

        // Uncomment to test egg scenes
        // addScene(this.game, AppSettingsKey, new NewEggFoundScene({ eggItemInstanceId: "123" }), true)
    }

    showDemoInfo() {
        this.removeMenu()
        showDemoScene(this.game)
    }

    loadSettings() {
        this.removeMenu()
        const settings = new AppSettingsScene()
        addScene(this.game, AppSettingsKey, settings, true)
    }

    private loadYourAttire() {
        this.removeMenu()
        const settings = new YouScene()
        addScene(this.game, YouKey, settings, true)
    }

    private loadStats() {
        this.removeMenu()
        const settings = new UserStatsScene()
        addScene(this.game, UserStatsKey, settings, true)
    }

    private loadTutorialFlow() {
        this.scene.pause("MainMenu")

        const options = {
            title: "",
            subtitle: "Have you played a\nflappy game before?",

            // TODO: Lol, these should be called primary/secondary
            yes: "NOPE!",
            no: "YES",

            y: (1 / 3) * c.GameHeight,

            completion: (response: boolean, prompt: Prompt) => {
                hasAskedAboutTutorial()
                prompt.dismiss()
                if (response) {
                    this.removeMenu()
                    launchTutorial(this.game)
                } else {
                    if (!hasName()) {
                        this.loadNamePrompt()
                    } else {
                        this.scene.resume("ManiMenu")
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
        this.scene.pause("MainMenu")
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
                prompt.dismiss()
                if (response) {
                    this.loadYourAttire()
                } else {
                    this.scene.resume("MainMenu")
                }
            }
        }

        showPrompt(options, this.game)
    }

    loadTrial() {
        if (this.seeds) {
            this.removeMenu()
            const seed = this.seeds.daily.production
            const lobby = new TrialLobby({ seed })
            addScene(this.game, "TrialLobby" + seed, lobby, true, {})
        } else {
            console.log("Not got seeds")
        }
    }

    private loadRoyale() {
        if (this.seeds) {
            this.removeMenu()
            const index = getAndBumpUserCycleSeedIndex(this.seeds && this.seeds.royale.length)
            const seed = this.seeds.royale[index]
            const lobby = new RoyaleLobby({ seed })
            addScene(this.game, "RoyaleLobby" + seed, lobby, true, {})
        } else {
            console.log("Not got seeds")
        }
    }

    removeMenu() {
        // We get a JS error if we just remove the scene before the new scene has started (finished?) loading
        // Phaser's docs claim scene.remove() will process the operation, but that seems to not be the case
        // Manually pushing the remove action til the next update loop seems to fix it /shrug
        defer(() => {
            this.game.scene.remove(this)
            this.battleBG.dismiss()
        })
    }
}
