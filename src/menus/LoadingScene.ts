import * as Phaser from "phaser"
import * as constants from "../constants"
import { getUserSettings } from "../user/userManager"
import * as appCache from "../appCache"

export interface LoadingProps {
    seed: string
}

export const showLoadingScreen = (game: Phaser.Game) => {
    const loadingScene = new LoadingScene()
    game.scene.scenes.forEach(s => game.scene.remove(s))
    game.scene.add("LoadingScene", loadingScene, true)
}

export class LoadingScene extends Phaser.Scene {
    progressBar: Phaser.GameObjects.Rectangle

    constructor() {
        super("LoadingScene")
    }

    preload() {
        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )
    }

    init() {
        appCache.onDownloadProgress((percent: number) => {
            console.log("Download!", percent)
            this.progressBar.width = (percent * constants.GameWidth) / 2
        })

        appCache.onDownloadEnd(() => {
            window.location.reload()
        })
    }

    create() {
        // Fill the BG
        this.add.rectangle(
            constants.GameWidth / 2,
            constants.GameHeight / 2,
            constants.GameWidth,
            constants.GameHeight,
            0x000000
        )

        const lobby = this.add.bitmapText(40, 80 + constants.NotchOffset, "nokia16", "Loading...")

        const loadingHeight = constants.GameHeight - 10
        // Add loading box
        this.add.rectangle(
            constants.GameWidth / 2 - 2,
            constants.GameHeight / 2 - 10 + constants.NotchOffset,
            constants.GameWidth / 2,
            14,
            0xffffff,
            0.3
        )

        this.progressBar = this.add.rectangle(
            constants.GameWidth / 4 - 2,
            constants.GameHeight / 2 - 10 + constants.NotchOffset,
            0,
            14,
            0xffffff
        )
    }
}
