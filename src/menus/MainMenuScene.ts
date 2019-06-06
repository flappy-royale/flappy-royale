import * as Phaser from "phaser"
import { UserSettings, UserSettingsKey } from "./UserSettingsScene"
import { getSeedsFromAPI, emptySeedData } from "../firebase"
import { BattleScene } from "../battle/Scene"
import * as constants from "../constants"
import { GameMode } from "../battle/utils/gameMode"
import { SeedsResponse } from "../../functions/src/api-contracts"
import { TrialLobby } from "./TrialLobby"
import { RoyaleLobby } from "./RoyaleLobby"
import { getAndBumpUserCycleSeedIndex, getUserSettings } from "../user/userManager"
import { preloadBackgroundBlogImages, setupBackgroundBlogImages } from "./utils/backgroundColors"
import _ = require("lodash")
import { preloadBirdSprites, BirdSprite } from "../battle/BirdSprite"

/** Used on launch, and when you go back to the main menu */
export const launchMainMenu = (game: Phaser.Game) => {
    const mainMenu = new MainMenuScene()
    game.scene.add("MainMenu", mainMenu, true)
}

export class MainMenuScene extends Phaser.Scene {
    seeds: SeedsResponse
    battleBG: BattleScene

    constructor() {
        super("MainMenu")
    }

    preload() {
        this.load.image("logo", require("../../assets/menu/logo.png"))
        this.load.image("royale-button", require("../../assets/menu/royale-2.png"))
        this.load.image("trial-button", require("../../assets/menu/trial-2.png"))
        this.load.image("settings-button", require("../../assets/menu/settings-2.png"))
        preloadBackgroundBlogImages(this)
        preloadBirdSprites(this)
    }

    create() {
        this.battleBG = new BattleScene({ seed: "menu", data: emptySeedData, gameMode: GameMode.Menu })
        this.game.scene.add("battlebg", this.battleBG, true)
        this.game.scene.bringToTop("MainMenu")

        // Fill the BG
        this.add.rectangle(
            constants.GameWidth / 2,
            constants.GameHeight / 2,
            constants.GameWidth,
            constants.GameHeight,
            0x000000,
            0.4
        )
        this.add.image(80, 50, "logo")
        setupBackgroundBlogImages(this)

        // NOTE: ASYNC!
        getSeedsFromAPI(constants.APIVersion).then(seeds => {
            this.seeds = seeds
        })

        const settings = getUserSettings()
        const player = new BirdSprite(this, 6, constants.GameHeight - 12, {
            isPlayer: false,
            settings: settings
        })
        player.actAsImage()

        this.add
            .image(84, 110, "royale-button")
            .setInteractive()
            // needs to be on up insider, but whatevs
            .on("pointerdown", async () => {
                this.removeMenu()

                const index = getAndBumpUserCycleSeedIndex(this.seeds.royale.length)
                const seed = this.seeds.royale[index]

                const lobby = new RoyaleLobby({ seed })
                this.game.scene.add("RoyaleLobby" + seed, lobby, true, {})
            })

        this.add
            .image(74, 146, "trial-button")
            .setInteractive()
            // needs to be on up inside, but whatevs
            .on("pointerdown", async () => {
                this.removeMenu()

                const seed = this.seeds.daily.production
                const lobby = new TrialLobby({ seed })
                this.game.scene.add("TrialLobby" + seed, lobby, true, {})
            })

        this.add
            .image(76, 200, "settings-button")
            .setInteractive()
            // needs to be on up insider, but whatevs
            .on("pointerdown", () => {
                this.removeMenu()
                const settings = new UserSettings()
                this.game.scene.add(UserSettingsKey, settings, true)
            })
    }

    removeMenu() {
        // We get a JS error if we just remove the scene before the new scene has started (finished?) loading
        // Phaser's docs claim scene.remove() will process the operation, but that seems to not be the case
        // Manually pushing the remove action til the next update loop seems to fix it /shrug
        _.defer(() => {
            this.game.scene.remove(this)
            this.game.scene.remove(this.battleBG)
        })
    }
}
