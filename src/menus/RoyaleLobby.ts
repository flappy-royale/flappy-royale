import * as Phaser from "phaser"
import { fetchRecordingsForSeed } from "../firebase"
import * as constants from "../constants"
import { BattleScene } from "../battle/Scene"
import { GameMode } from "../battle/utils/gameMode"
import { BirdSprite, setupBirdAnimations, preloadBirdAttire } from "../battle/BirdSprite"
import { defaultSettings, getUserSettings } from "../user/userManager"
import { launchMainMenu } from "./MainMenuScene"

export interface RoyaleLobbyProps {
    seed: string
}

// This is a little brute-force-y code for the moment

export class RoyaleLobbyScene extends Phaser.Scene {
    private seed: string

    constructor(props: RoyaleLobbyProps) {
        super("RoyaleLobbyScene")
        this.seed = props.seed
        console.log("Starting Royale with seed: " + props.seed)
    }

    preload() {
        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )
        this.load.image("royale-button", require("../../assets/menu/royale.png"))

        this.load.image("flap1", require("../../assets/battle/Flap1.png"))
        this.load.image("flap2", require("../../assets/battle/Flap2.png"))
        this.load.image("flap3", require("../../assets/battle/Flap3.png"))

        const settings = getUserSettings()
        preloadBirdAttire(this, settings)
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

        this.add.bitmapText(20, 20, "nokia16", "Starting Royale")

        setupBirdAnimations(this)

        const settings = getUserSettings()
        const bird = new BirdSprite(this, 70, 60, { isPlayer: false, settings: settings })
        bird.actAsImage()

        const lobby = this.add.bitmapText(40, 80, "nokia16", "...")

        const royale = this.add
            .image(80, 160, "royale-button")
            .setAlpha(0.2)
            .setInteractive()

        const back = this.add.image(20, 10, "back-button").setInteractive()
        // needs to be on up insider, but whatever
        back.on("pointerdown", () => {
            this.game.scene.remove(this)
            launchMainMenu(this.game)
        })

        fetchRecordingsForSeed(this.seed).then(seedData => {
            this.tweens.addCounter({
                from: 0,
                to: seedData.replays.length,
                ease: "Cubic", // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: Math.floor(Math.random() * 2000),
                repeat: 0,
                onUpdate: (v: Phaser.Tweens.Tween) => (lobby.text = `${Math.round(v.getValue())} birds`)
            })

            seedData.replays.forEach(score => preloadBirdAttire(this, score.user))

            const preloadAssetsDone = () => {
                royale.setAlpha(1)
                royale.once("pointerdown", async () => {
                    const scene = new BattleScene({ seed: this.seed, data: seedData, gameMode: GameMode.Royale })
                    this.game.scene.add("BattleScene" + this.seed, scene, true, {})
                })
            }

            this.load.once("complete", preloadAssetsDone, this)
            this.load.start()
        })
    }
}
