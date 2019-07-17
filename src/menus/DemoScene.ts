import * as Phaser from "phaser"
import { BattleScene } from "../battle/Scene"
import * as c from "../constants"
import { GameMode } from "../battle/utils/gameMode"
import { preloadBackgroundBlobImages, setupBackgroundBlobImages } from "./utils/backgroundColors"
import { defer } from "lodash"
import { addScene } from "./utils/addScene"
import { GameTheme } from "../battle/theme"
import { becomeButton } from "./utils/becomeButton"
import { launchMainMenu } from "./MainMenuScene"
import { openURL } from "../nativeComms/openURL"

const DemoSceneKey = "DemoScene"

/** Used on launch, and when you go back to the main menu */
export const showDemoScene = (game: Phaser.Game): DemoScene => {
    const scene = new DemoScene()
    addScene(game, DemoSceneKey, scene, true)
    return scene
}

export class DemoScene extends Phaser.Scene {
    battleBG!: BattleScene
    logo!: Phaser.GameObjects.Image

    constructor() {
        super(DemoSceneKey)
    }

    preload() {
        this.load.image("footer-bg", require("../../assets/menu/BottomSash.png"))
        this.load.image("back", require("../../assets/menu/Back2.png"))
        this.load.image("ios-app-store", require("../../assets/menu/app-store.png"))
        this.load.image("play-app-store", require("../../assets/menu/play-store.png"))
        this.load.image("neon-egg", require("../../assets/menu/eggs/EggEpic.png"))

        this.load.bitmapFont(
            "fipps-bit",
            require("../../assets/fonts/fipps.png"),
            require("../../assets/fonts/fipps.fnt")
        )
    }

    create() {
        // Fill the BG
        this.add.rectangle(c.GameWidth / 2, c.GameHeight / 2, c.GameWidth, c.GameHeight, 0x000000)

        this.add.particles("", {
            x: c.GameWidth - 40,
            y: c.GameHeight / 2 + 6,
            scale: { start: 0.02, end: 0.05 },
            blendMode: "ADD",
            maxParticles: 0,
            lifespan: 11000,
            speed: 10,
            tint: 0x221199
        })

        this.add.bitmapText(10, 10 + c.GameAreaTopOffset, "fipps-bit", "GET THE", 8)
        this.add.bitmapText(10, 24 + c.GameAreaTopOffset, "fipps-bit", "FULL ROYALE", 8)

        this.add.bitmapText(10, 50 + c.GameAreaTopOffset, "fipps-bit", "MORE LIVES", 8)
        this.add.bitmapText(10, 64 + c.GameAreaTopOffset, "fipps-bit", "MORE STYLE", 8)

        this.add.bitmapText(10, 90 + c.GameAreaTopOffset, "fipps-bit", "ONLY ON", 8)
        this.add.bitmapText(10, 104 + c.GameAreaTopOffset, "fipps-bit", "MOBILE", 8)

        this.add.rectangle(c.GameWidth / 2, c.GameHeight - 40, c.GameWidth, 80, 0xffffff)

        this.add.image(80, c.GameHeight - 8, "footer-bg")

        const egg = this.add.image(c.GameWidth - 40, c.GameHeight / 2 + 6, "neon-egg")
        egg.setAngle(-10)
        this.add.tween({
            targets: [egg],
            scaleX: 1,
            scaleY: 1,
            x: "+= 1",
            y: "+=1",
            angle: "10",
            _ease: "Sine.easeInOut",
            ease: "Power2",
            duration: 450,
            repeat: -1,
            yoyo: true
        })

        const appStore = this.add.image(40, c.GameHeight - 60, "ios-app-store")
        becomeButton(appStore, this.goToAppStore, this)

        const playStore = this.add.image(c.GameWidth - 40, c.GameHeight - 60, "play-app-store")
        becomeButton(playStore, this.goToAppStore, this)

        const back = this.add.image(16, c.GameHeight - 20, "back")
        becomeButton(back, this.goBackToMainMenu, this)
    }

    goToAppStore() {
        openURL("https://apps.apple.com/us/app/id1469168509")
    }

    goToPlayStore() {
        openURL("https://play.google.com/store/apps/details?id=com.lazerwalker.flappyroyale")
    }

    goBackToMainMenu() {
        this.scene.remove()
        launchMainMenu(this.game)
    }
}
