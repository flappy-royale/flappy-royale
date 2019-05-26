import * as Phaser from "phaser"
import { fetchRecordingsForSeed } from "../firebase"
import * as constants from "../constants"
import { BattleScene } from "../battle/Scene"
import { GameMode } from "../battle/utils/gameMode"
import { BirdSprite, setupBirdAnimations, preloadBirdAttire } from "../battle/BirdSprite"
import { defaultSettings } from "../user/userManager"

export interface TrialLobbyProps {
    seed: string
}

// This is a little brute-force-y code for the moment

export class TrialLobbyScene extends Phaser.Scene {
    private seed: string

    constructor(props: TrialLobbyProps) {
        super("TrialLobbyScene")
        this.seed = props.seed
    }

    preload() {
        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )
        this.load.image("trial-button", require("../../assets/menu/trial.png"))

        this.load.image("flap1", require("../../assets/battle/Flap1.png"))
        this.load.image("flap2", require("../../assets/battle/Flap2.png"))
        this.load.image("flap3", require("../../assets/battle/Flap3.png"))

        defaultSettings.aesthetics.attire.forEach(attire => {
            this.load.image(attire.id, attire.href)
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

        const rank1Text = this.add.bitmapText(40, 20, "nokia16", "...")
        const rank2Text = this.add.bitmapText(40, 40, "nokia16", "...")
        const rank3Text = this.add.bitmapText(40, 60, "nokia16", "...")

        setupBirdAnimations(this)

        const bird = new BirdSprite(this, 20, 30, { isPlayer: false, settings: defaultSettings })
        bird.actAsImage()

        const bird2 = new BirdSprite(this, 20, 50, { isPlayer: false, settings: defaultSettings })
        bird2.actAsImage()

        const bird3 = new BirdSprite(this, 20, 70, { isPlayer: false, settings: defaultSettings })
        bird3.actAsImage()

        const trial = this.add
            .image(80, 160, "trial-button")
            .setAlpha(0.2)
            .setInteractive()

        // const scene = new BattleScene({ seed, data: playerData, gameMode: GameMode.Trial })
        fetchRecordingsForSeed(this.seed).then(seedData => {
            // Fill out the data we'll preview
            const sortedScores = seedData.users.sort((lhs, rhs) => rhs.score - lhs.score)

            if (sortedScores[0]) {
                rank1Text.text = `${sortedScores[0].user.name} ${sortedScores[0].score}`
            }
            if (sortedScores[1]) {
                rank2Text.text = `${sortedScores[1].user.name} ${sortedScores[1].score}`
            }
            if (sortedScores[2]) {
                rank3Text.text = `${sortedScores[2].user.name} ${sortedScores[2].score}`
            }

            sortedScores.slice(0, 3).forEach(score => preloadBirdAttire(this, score.user))

            const updateBirds = () => {
                bird.destroy()
                bird2.destroy()
                bird3.destroy()

                if (sortedScores[0]) {
                    const newBird1 = new BirdSprite(this, 20, 30, { isPlayer: false, settings: sortedScores[0].user })
                    newBird1.actAsImage()
                }

                if (sortedScores[1]) {
                    const newBird2 = new BirdSprite(this, 20, 50, { isPlayer: false, settings: sortedScores[1].user })
                    newBird2.actAsImage()
                }

                if (sortedScores[1]) {
                    const newBird3 = new BirdSprite(this, 20, 70, { isPlayer: false, settings: sortedScores[2].user })
                    newBird3.actAsImage()
                }

                debugger

                // Now we're preloaded you can join
                trial.setAlpha(1)
                trial.once("pointerdown", async () => {
                    const scene = new BattleScene({ seed: this.seed, data: seedData, gameMode: GameMode.Trial })
                    this.game.scene.add("BattleScene" + this.seed, scene, true, {})
                })
            }

            // Preload the first three birds attire
            this.load.once("complete", updateBirds, this)
            this.load.start()
        })
    }
}
