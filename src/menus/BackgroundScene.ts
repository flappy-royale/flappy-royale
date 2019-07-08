import * as Phaser from "phaser"
import { BattleScene } from "../battle/Scene"
import * as c from "../constants"
import { GameMode } from "../battle/utils/gameMode"
import { preloadBackgroundBlobImages, setupBackgroundBlobImages } from "./utils/backgroundColors"
import { defer } from "lodash"
import { addScene } from "./utils/addScene"
import { GameTheme } from "../battle/theme"

/** This is a scene that contains everything on the main menu but the menu itself
 * e.g. a scrolling game background with no birds, a dark overlay over it, a logo, and some confetti
 * We use this e.g. when showing the tutorial prompt, or other modal prompts that would otherwise be over DOM scenes. */

const BackgroundSceneKey = "BackgroundScene"

/** Used on launch, and when you go back to the main menu */
export const showBackgroundScene = (game: Phaser.Game): BackgroundScene => {
    const scene = new BackgroundScene()
    addScene(game, BackgroundSceneKey, scene, true)
    return scene
}

export class BackgroundScene extends Phaser.Scene {
    battleBG!: BattleScene
    logo!: Phaser.GameObjects.Image

    key = BackgroundSceneKey

    constructor() {
        super(BackgroundSceneKey)
    }

    preload() {
        this.load.image("logo", require("../../assets/menu/logo.png"))

        preloadBackgroundBlobImages(this)

        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )
    }

    create() {
        this.battleBG = new BattleScene({
            seed: "bg",
            gameMode: GameMode.Menu,
            theme: GameTheme.default
        })
        addScene(this.game, this.battleBG.key, this.battleBG, true)

        // Fill the BG
        this.add.rectangle(c.GameWidth / 2, c.GameHeight / 2, c.GameWidth, c.GameHeight, 0x000000, 0.4)

        this.logo = this.add.image(84, 50 + c.NotchOffset, "logo")

        setupBackgroundBlobImages(this, { min: 100 + c.NotchOffset, allColors: true })

        this.bringToTop()
    }

    bringToTop() {
        this.game.scene.bringToTop(this.battleBG.key)
        this.game.scene.bringToTop(this.key)
    }

    dismiss() {
        // We get a JS error if we just remove the scene before the new scene has started (finished?) loading
        // Phaser's docs claim scene.remove() will process the operation, but that seems to not be the case
        // Manually pushing the remove action til the next update loop seems to fix it /shrug
        defer(() => {
            this.game.scene.remove(this)
            this.game.scene.remove(this.battleBG)
        })
    }
}
