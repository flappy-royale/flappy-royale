import * as Phaser from "phaser"
import * as constants from "../constants"
import { getUserSettings } from "../user/userManager"
import { UserSettings } from "../user/UserSettingsTypes"
import { preloadBirdSprites, setupBirdAnimations, BirdSprite } from "../battle/BirdSprite"
import { launchMainMenu } from "./MainMenuScene"
import { becomeButton } from "./utils/becomeButton"
import { openURL } from "../nativeComms/openURL"
import { showLoadingScreen } from "./LoadingScene"
import * as appCache from "../appCache"

export class AppLaunchScene extends Phaser.Scene {
    progressBar!: Phaser.GameObjects.Rectangle
    birds: BirdSprite[] = []
    possibleAttires: UserSettings[] = []

    // If true, should attempt to show a loading screen after completion
    showLoadingScreen: boolean = false

    constructor() {
        super("Launch")
    }

    preload() {
        preloadBirdSprites(this)

        this.load.image("underground", require("../../assets/battle/themes/default/ground-under.png"))
        this.load.image("poster", require("../../assets/menu/royale-sign.png"))
        this.load.audio("other_flap", [
            require("../../assets/audio/silence.wav"),
            require("../../assets/audio/silence.mp3")
        ])

        this.load.bitmapFont(
            "fipps-bit",
            require("../../assets/fonts/fipps.png"),
            require("../../assets/fonts/fipps.fnt")
        )
    }

    create() {
        setupBirdAnimations(this)

        this.add.rectangle(
            constants.GameWidth / 2,
            constants.GameHeight / 2,
            constants.GameWidth,
            constants.GameHeight,
            0x53381f
        )

        this.add.image(constants.GameWidth / 2, 0, "underground").setScale(2, 2)
        const vCenter = constants.GameHeight
        const offset = 10

        this.add.image((constants.GameWidth / 3) * 2, constants.NotchOffset + 80, "poster")

        this.add.bitmapText(20, vCenter - offset - 80, "fipps-bit", "A game by", 8).setAlpha(0.6)
        const orta = this.add.bitmapText(20, vCenter - offset - 60, "fipps-bit", "Orta Therox", 8)
        becomeButton(orta, this.showOrta, this)

        const lazer = this.add.bitmapText(20, vCenter - offset - 44, "fipps-bit", "Em Lazer-Walker", 8)
        becomeButton(lazer, this.showEm, this)

        const zach = this.add.bitmapText(20, vCenter - offset - 20, "fipps-bit", "with Zach Gage", 8)
        becomeButton(zach, this.showZach, this)

        const bird = new BirdSprite(this, -20, constants.GameHeight / 2 + constants.NotchOffset, {
            isPlayer: false,
            settings: getUserSettings()
        })
        bird.setOpacity(1)
        bird.setScale(1.5)
        bird.flap()
        bird.startMovingLeft(constants.pipeSpeed * 0.85)

        this.time.addEvent({
            delay: 650,
            callback: () => {
                bird.flap()
                bird.startMovingLeft(constants.pipeSpeed * 0.85)
            },
            loop: true
        })

        this.time.delayedCall(
            3900,
            () => {
                if (this.showLoadingScreen) {
                    if (appCache.downloaded) {
                        localStorage.setItem("skipLaunchScreen", "true")
                        window.location.reload()
                    } else {
                        showLoadingScreen(this.game)
                    }
                } else {
                    this.game.scene.remove("launcher")
                    launchMainMenu(this.game)
                }
            },
            [],
            this
        )

        window.dispatchEvent(new Event("gameloaded"))
    }

    showOrta() {
        openURL("https://orta.io")
    }

    showEm() {
        openURL("https://lazerwalker.com")
    }

    showZach() {
        openURL("http://stfj.net/")
    }
}
