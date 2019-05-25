import * as Phaser from "phaser"
import { UserSettings, UserSettingsKey } from "./UserSettingsScene"
import { getSeedsFromAPI, fetchRecordingsForSeed, emptySeedData } from "../firebase"
import { BattleScene } from "../battle/Scene"
import * as constants from "../constants"
import { GameMode } from "../battle/utils/gameMode"
import { SeedsResponse } from "../../functions/src/api-contracts"
import { TrialLobbyScene } from "./TrialLobbyScene"
import { RoyaleLobbyScene } from "./RoyaleLobby"

export class MainMenuScene extends Phaser.Scene {
    seeds: SeedsResponse

    constructor() {
        super("MainMenu")
    }

    preload() {
        this.load.image("royale-button", require("../../assets/menu/royale.png"))
        this.load.image("trial-button", require("../../assets/menu/trial.png"))
        this.load.image("training-button", require("../../assets/menu/training.png"))
        this.load.image("settings-button", require("../../assets/menu/settings.png"))
        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )
    }

    create() {
        // NOTE: ASYNC!
        getSeedsFromAPI(constants.APIVersion).then(seeds => {
            this.seeds = seeds
        })

        this.add
            .image(80, 40, "royale-button")
            .setInteractive()
            // needs to be on up insider, but whatevs
            .on("pointerdown", async () => {
                const seed = this.seeds.daily.production
                const lobby = new RoyaleLobbyScene({ seed })
                this.game.scene.remove(this)
                this.game.scene.add("RoyaleLobby" + seed, lobby, true, {})
            })

        this.add
            .image(80, 80, "trial-button")
            .setInteractive()
            // needs to be on up inside, but whatevs
            .on("pointerdown", async () => {
                const seed = this.seeds.daily.production
                const lobby = new TrialLobbyScene({ seed })
                this.game.scene.remove(this)
                this.game.scene.add("TrialLobby" + seed, lobby, true, {})
            })

        this.add
            .image(80, 120, "training-button")
            .setInteractive()
            // needs to be on up inside, but whatevs
            .on("pointerdown", async () => {
                let seed = "offline-seed"
                try {
                    const seeds = await getSeedsFromAPI(constants.APIVersion)
                    seed = seeds.daily.production
                } catch (error) {
                    // NOOP
                }

                const scene = new BattleScene({ seed, data: emptySeedData, gameMode: GameMode.Training })
                this.game.scene.remove(this)
                this.game.scene.add("BattleScene" + seed, scene, true, {})
            })

        this.add
            .image(80, 200, "settings-button")
            .setInteractive()
            // needs to be on up insider, but whatevs
            .on("pointerdown", () => {
                const settings = new UserSettings()
                this.game.scene.remove(this)
                this.game.scene.add(UserSettingsKey, settings, true)
            })
    }
}
