import * as Phaser from "phaser"
import { UserSettings, UserSettingsKey } from "./UserSettingsScene"
import { getSeedsFromAPI, fetchRecordingsForSeed, emptySeedData } from "../firebase"
import { BattleScene } from "../battle/Scene"
import * as constants from "../constants"
import { GameMode } from "../battle/utils/gameMode"

export class MainMenuScene extends Phaser.Scene {
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
        this.add
            .image(80, 40, "royale-button")
            .setInteractive()
            // needs to be on up insider, but whatevs
            .on("pointerdown", async () => {
                const seeds = await getSeedsFromAPI(constants.APIVersion)
                const seed = seeds.daily.production
                const playerData = await fetchRecordingsForSeed(seed)

                const scene = new BattleScene({ seed, data: playerData, gameMode: GameMode.Royale })
                this.game.scene.add("BattleScene" + seed, scene, true, {})
            })

        this.add
            .image(80, 80, "trial-button")
            .setInteractive()
            // needs to be on up inside, but whatevs
            .on("pointerdown", async () => {
                const seeds = await getSeedsFromAPI(constants.APIVersion)
                const seed = seeds.daily.production
                const playerData = await fetchRecordingsForSeed(seed)

                const scene = new BattleScene({ seed, data: playerData, gameMode: GameMode.Trial })
                this.game.scene.add("BattleScene" + seed, scene, true, {})
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
                this.game.scene.add("BattleScene" + seed, scene, true, {})
            })

        this.add
            .image(80, 200, "settings-button")
            .setInteractive()
            // needs to be on up insider, but whatevs
            .on("pointerdown", () => {
                const settings = new UserSettings()
                this.game.scene.add(UserSettingsKey, settings, true)
            })
    }
}
