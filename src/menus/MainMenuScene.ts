import * as Phaser from "phaser"
import { UserSettings, UserSettingsKey } from "./UserSettingsScene"
import { FirebaseDataStore, getSeedsFromAPI } from "../firebase"
import { BattleScene } from "../battle/Scene"
import * as constants from "../constants"

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super("MainMenu")
    }

    preload() {
        this.load.image("royale-button", require("../../assets/menu/royale.png"))
        this.load.image("trial-button", require("../../assets/menu/trial.png"))
        this.load.image("training-button", require("../../assets/menu/training.png"))
        this.load.image("settings-button", require("../../assets/menu/settings.png"))
    }

    create() {
        this.add
            .image(80, 40, "royale-button")
            .setInteractive()
            // needs to be on up insider, but whatevs
            .on("pointerdown", async () => {
                const firebase = new FirebaseDataStore(constants.APIVersion)
                const seeds = await getSeedsFromAPI(constants.APIVersion)
                const seed = seeds.royale.production
                await firebase.fetch(seed)

                const scene = new BattleScene({ seed })
                this.game.scene.add("BattleScene" + seed, scene, true, firebase)
            })

        this.add
            .image(80, 80, "trial-button")
            .setInteractive()
            // needs to be on up inside, but whatevs
            .on("pointerdown", async () => {
                const firebase = new FirebaseDataStore(constants.APIVersion)
                const seeds = await getSeedsFromAPI(constants.APIVersion)
                const seed = seeds.trials.production
                await firebase.fetch(seed)

                const scene = new BattleScene({ seed })
                this.game.scene.add("BattleScene" + seed, scene, true, firebase)
            })

        this.add
            .image(80, 120, "training-button")
            .setInteractive()
            // needs to be on up inside, but whatevs
            .on("pointerdown", async () => {
                const firebase = new FirebaseDataStore(constants.APIVersion)
                const seeds = await getSeedsFromAPI(constants.APIVersion)
                const seed = seeds.royale.production
                await firebase.fetch(seed)

                const scene = new BattleScene({ seed })
                this.game.scene.add("BattleScene" + seed, scene, true, firebase)
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
