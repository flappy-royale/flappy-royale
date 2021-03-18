import * as Phaser from "phaser"
import * as Seed from "seed-random"
import * as constants from "../constants"
import * as game from "./utils/gameMode"

import { uploadReplayForSeed, emptySeedData } from "../firebase"
import { preloadBackgroundSprites, bgUpdateTick, createBackgroundSprites } from "./Background"
import { preloadPipeSprites, pipeOutOfBoundsCheck, nudgePipesOntoPixelGrid, addRowOfPipes } from "./PipeManager"
import { BirdSprite, preloadBirdSprites, setupBirdAnimations, preloadAllBirdAttire } from "./BirdSprite"
import { addScoreLine } from "./scoreLine"
import { enablePhysicsLogging } from "./debugging/enablePhysicsLogging"
import { createBus, busCrashed, preloadBusImages } from "./utils/createBus"
import { setupDeveloperKeyboardShortcuts } from "./debugging/keyboardShortcut"
import { BattleAnalytics } from "./utils/battleAnalytics"
import {
    getUserSettings,
    subtractALife,
    getLives,
    getHighScore,
    setHighScore,
    livesExtensionStateForSeed,
    saveDailyTrialRun
} from "../user/userManager"
import { Bird } from "../user/UserSettingsTypes"
import { launchMainMenu } from "../menus/MainMenuScene"
import { RoyaleDeath, deathPreload, RoyaleDeathSceneKey } from "./overlays/RoyaleDeathScene"
import { becomeButton } from "../menus/utils/becomeButton"
import { rightAlignTextLabel, centerAlignTextLabel } from "./utils/alignTextLabel"
import { TrialDeath } from "./overlays/TrialDeathScene"
import { analyticsEvent } from "../nativeComms/analytics"
import { GameTheme, themeMap } from "./theme"
import _ = require("lodash")
import * as PlayFab from "../playFab"
import { playSound } from "../playSound"
import { useLowQuality, shouldMeasureQuality, enableAutoLowQualityMode, getSettings, DarkMode } from "../gameSettings"
import { SeedData, PlayerEvent } from "../firebaseTypes"

declare const DEMO: boolean

export interface BattleSceneSettings {
    /** The string representation for the level */
    seed: string
    /** The data from firebase */
    data?: SeedData
    /** Game mode */
    gameMode: game.GameMode
    /** a UUID for the game scene  */
    key?: string
    /** What is the current theme? */
    theme?: GameTheme
}

const devSettings = {
    // Turn off for release builds
    developer: constants.isInDevMode,
    // Allows flying through pipes
    skipPipeCollision: false,
    // Allows falling off the bottom
    skipBottomCollision: false,
    // Show bounding boxes for physics objs
    debugPhysics: false,
    // Lets you easily hide all UI elements
    showUI: true,
    // Lets you load all attire in
    preloadAllAttire: false,
    // Auto-play
    autoPlayWithBestReplay: false
}

export class BattleScene extends Phaser.Scene {
    /** The starting bus */
    private bus: Phaser.Physics.Arcade.Image | undefined

    /** Your sprite, or if behind the main menu - not set up for this game mode */
    private bird: BirdSprite | undefined

    /** Opponent */
    private ghostBirds: BirdSprite[] = []

    /** Every pipe is a set of physics objects */
    private pipes: Phaser.Physics.Arcade.Group[] = []

    /** All the current scorelines on screen */
    private scoreLines: Phaser.Physics.Arcade.Image[] = []

    /** A timer for generating new pipes */
    private newPipeTimer: Phaser.Time.TimerEvent | undefined

    /** Keeping track of events from the user, sent up later */
    private userInput: PlayerEvent[] = []

    /** A seed for the RNG function */
    public seed: string

    /** The data (user recordings etc) for this seed  */
    public seedData: SeedData

    /** The phaser Scene manager key */
    public key: string

    /* Scene timestamp for when the most recent round started
     * So recording timestamps can be consistent */
    private timestampOffset: number = 0

    /** When we last stored a "sync" data point for the user.
     * This is the number of ms since the scene started, not since the round started */
    private lastSyncedTimestamp = 0

    /** Developer logging */
    private debugLabel!: Phaser.GameObjects.Text

    /** The RNG function for this current run, pipes, and all ghosts */
    public rng!: () => number

    /** Track spacebar keypresses to flap */
    private spacebar: Phaser.Input.Keyboard.Key | undefined

    // See debugging/keyboardShortcuts.ts
    public devKeys!: object

    // What score did someone just get
    public score: number = 0

    // What the player's current high score for this seed is
    public highScore: number = 0

    /** How we show your score */
    private scoreLabel: Phaser.GameObjects.BitmapText | undefined

    /** Your avatar, for showing your high score */
    private highScoreIcon: BirdSprite | undefined

    /** How we show your daily high score in Trial */
    private highScoreLabel: Phaser.GameObjects.BitmapText | undefined

    /** Where we tell you how many are left */
    private birdsLeft: Phaser.GameObjects.BitmapText | undefined

    /** What you see to go back, hides on dying in a royale */
    private backButton: Phaser.GameObjects.Image | undefined

    /**  Analytics state management */
    private analytics: BattleAnalytics

    /** What game mode is this scene running in? */
    public mode: game.GameMode

    /** The thing that represents the floor (birds/the bus sit on this) */
    public floorPhysics!: Phaser.Physics.Arcade.Image

    /** How to render the BG */
    private theme: GameTheme

    /** FPS AUTO QUALITY DETECTION */
    /** If true, actively measuring FPS (for auto quality detection) */
    private measuringFps: boolean = true

    /** The last time an update() function ran, for fps/quality detection  */
    private lastUpdateTimestamp: number = 0

    /** An array containing implied FPS numbers for each discrete update call */
    private runningFpsTally: number[] = []

    /** When the game started, for tracking time in game */
    private startTimestamp: number | undefined

    constructor(opts: BattleSceneSettings) {
        super(
            Object.assign(
                {
                    key: "GameScene" + opts.seed,
                    active: false
                },
                opts
            )
        )

        this.key = "GameScene" + opts.seed

        this.analytics = new BattleAnalytics()
        this.seed = opts.seed
        this.seedData = opts.data || emptySeedData
        this.mode = opts.gameMode

        if (opts.theme) {
            this.theme = opts.theme
        } else {
            const settings = getSettings()
            if (settings.darkMode === DarkMode.Auto) {
                const now = new Date()
                // 8pm-8am.
                // We could manually tweak this, we could also try to grab user's local sunrise/sunset
                let darkMode = now.getHours() > 20 || now.getHours() < 7
                this.theme = darkMode ? GameTheme.night : GameTheme.default
            } else if (settings.darkMode === DarkMode.On) {
                this.theme = GameTheme.night
            } else {
                this.theme = GameTheme.default
            }
        }
    }

    // This happens when the scene is being played by the game (more
    // like UIKit's viewDidLoad instead of the constructor)
    //
    init() {
        this.resetGame()

        if (!canRecordScore()) {
            console.log("Not recording inputs, because a dev option is set")
        }

        const flap = this.userFlap.bind(this)
        window.addEventListener("touchstart", flap)
        window.addEventListener("mousedown", flap)

        const killBirdOnBlur = () => {
            if (this.bird && !this.bird.isDead) {
                this.userDied()
            }
        }

        window.addEventListener("blur", killBirdOnBlur)
        window.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                killBirdOnBlur()
            }
        })

        this.events.on("destroy", () => {
            window.removeEventListener("touchstart", flap)
            window.removeEventListener("mousedown", flap)
            window.removeEventListener("blur", killBirdOnBlur)
        })

        // When you have reduced ghost birds, then we don't get the callbacks to trigger position updates
        this.time.addEvent({ delay: 300, callback: this.updatePositionUI, callbackScope: this, loop: true })
    }

    preload() {
        this.load.image("invis", require("../../assets/InvisiblePX.png"))
        this.load.bitmapFont(
            "nokia16",
            require("../../assets/fonts/nokia16.png"),
            require("../../assets/fonts/nokia16.xml")
        )

        preloadBusImages(this, this.theme)
        preloadPipeSprites(this, this.theme)
        preloadBirdSprites(this)
        if (devSettings.preloadAllAttire) preloadAllBirdAttire(this)
        preloadBackgroundSprites(this, this.theme)
        deathPreload(this)

        this.load.image("back-button", require("../../assets/menu/Back2.png"))

        this.load.audio("flap", [require("../../assets/audio/flap.mp3"), require("../../assets/audio/flap.wav")])
        this.load.audio("hit", [require("../../assets/audio/hit.mp3"), require("../../assets/audio/hit.wav")])
        this.load.audio("point", [require("../../assets/audio/point.mp3"), require("../../assets/audio/point.wav")])

        this.load.audio("other_flap", [
            require("../../assets/audio/other_flap.mp3"),
            require("../../assets/audio/other_flap.wav")
        ])
        this.load.audio("other_hit", [
            require("../../assets/audio/other_hit.mp3"),
            require("../../assets/audio/other_hit.wav")
        ])

        this.load.audio("crash", [require("../../assets/audio/crash.mp3"), require("../../assets/audio/crash.wav")])
        this.load.audio("win", [require("../../assets/audio/win.mp3"), require("../../assets/audio/win.wav")])

        this.load.image("heart", require("../../assets/battle/heart.png"))
    }

    create() {
        this.sound.add("flap")
        this.sound.add("hit")
        this.sound.add("point")

        this.sound.add("other_flap")
        this.sound.add("other_hit")

        this.sound.add("crash")
        this.sound.add("win")

        this.time.update(0, 0)

        // Fill the BG
        this.add.rectangle(
            constants.GameWidth / 2,
            constants.GameHeight / 2,
            constants.GameWidth,
            constants.GameHeight,
            themeMap[this.theme].bgColor
        )

        if (devSettings.debugPhysics) {
            enablePhysicsLogging(this)
        }

        // setup bg + animations
        createBackgroundSprites(this, this.theme)
        setupBirdAnimations(this)
        this.setupPhysicsFloor()

        this.bus = createBus(this, this.theme)

        this.physics.add.collider(this.bus, this.floorPhysics)

        // Set up the competitor birds
        if (game.showGhostBirds(this.mode)) {
            let replays = this.seedData.replays.sort((l, r) => r.score - l.score) // Sorted descending

            if (useLowQuality()) {
                replays = replays.slice(0, 60)
            }

            if (shouldMeasureQuality() && this.mode === game.GameMode.Royale) {
                this.measuringFps = true
            }

            replays.forEach(input => {
                let settings: Bird
                if (input.playfabUser) {
                    settings = {
                        name: input.playfabUser.name,
                        aesthetics: { attire: PlayFab.avatarUrlToAttire(input.playfabUser.avatarUrl) }
                    }
                } else if (input.user) {
                    // Anyone who isn't a playfab user should have a UserSettings object
                    // Also, we shouldn't ever be getting these users sent down as replays, so we probably can/should kill this
                    settings = input.user
                } else {
                    return
                }
                const ghost = new BirdSprite(
                    this,
                    constants.birdXPosition,
                    constants.birdYPosition + constants.GameAreaTopOffset,
                    {
                        isPlayer: false,
                        settings
                    }
                )
                ghost.setupForBeingInBus()
                ghost.addCollideForSprite(this, this.floorPhysics)
                this.ghostBirds.push(ghost)
            })
        }

        if (this.bird) {
            this.bird.destroy()
        }

        if (game.showPlayerBird(this.mode)) {
            const settings = getUserSettings()
            const birdConfig = { isPlayer: true, settings }
            this.bird = new BirdSprite(
                this,
                constants.birdXPosition,
                constants.birdYPosition + constants.GameAreaTopOffset,
                birdConfig
            )

            this.bird.setupForBeingInBus()
            this.bird.addCollideForSprite(this, this.floorPhysics)

            // On spacebar bounce the bird
            this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        }

        // This sets up a new pipe every x seconds
        const startPipeTimer = () => {
            if (this.bird && this.bird.isDead) return

            this.newPipeTimer = this.time.addEvent({
                delay: constants.pipeRepeatTime, // We want 60px difference
                callback: () => this.addPipe(),
                callbackScope: this,
                loop: true
            })
        }
        this.time.delayedCall(constants.timeBeforeFirstPipeLoads, startPipeTimer, [], this)

        this.debugLabel = this.add.text(10, 200 + constants.GameAreaTopOffset, "", {
            fontFamily: "PT Mono",
            fontSize: "12px"
        })
        this.debugLabel.setDepth(constants.zLevels.debugText)

        if (devSettings.showUI && game.shouldShowScoreLabel(this.mode)) {
            this.scoreLabel = this.add.bitmapText(0, constants.NotchOffset, "nokia16", "0", 32)
            this.scoreLabel.setDepth(constants.zLevels.ui)
            this.updateScoreLabel()
        }

        if (devSettings.showUI && game.shouldShowLivesLabel(this.mode)) {
            const isTop = !game.shouldShowBirdsLeftLabel(this.mode)
            const yPos = isTop ? constants.NotchOffset + 4 : constants.NotchOffset + 22

            const livesNum = getLives(this.seed)
            const lives = livesNum - 1

            this.add.bitmapText(24, yPos, "nokia16", `${lives}`, 16).setDepth(constants.zLevels.ui)
            this.add.image(14, yPos + 8, "heart").setDepth(constants.zLevels.ui)
        }

        if (devSettings.showUI && game.shouldShowHighScoreLabel(this.mode)) {
            this.highScore = getHighScore(this.seed)
            this.renderHighScores()
        }

        // When we want to show a countdown, set it up with defaults
        if (devSettings.showUI && game.shouldShowBirdsLeftLabel(this.mode)) {
            this.birdsLeft = this.add.bitmapText(4, constants.NotchOffset + 4, "nokia16", "0", 16)
            this.birdsLeft.setDepth(constants.zLevels.ui)
            this.ghostBirdHasDied()
        }

        if (devSettings.developer) {
            this.devKeys = setupDeveloperKeyboardShortcuts(this)
        }

        // Keep track of stats for using later
        this.analytics.startRecording({ totalBirds: this.ghostBirds.length, mode: this.mode })
        this.startTimestamp = Date.now()

        if (devSettings.showUI && this.mode !== game.GameMode.Menu) {
            const back = this.add.image(16, constants.GameHeight - 20, "back-button").setInteractive()
            becomeButton(back, this.goBackToMainMenu, this)

            back.setDepth(constants.zLevels.ui)
            this.backButton = back
        }

        this.runningFpsTally = []
    }

    private goBackToMainMenu() {
        this.game.scene.remove(this.key)
        launchMainMenu(this.game)
    }

    private renderHighScores() {
        let highScoreText = `${this.highScore}`

        if (this.highScoreLabel) {
            this.highScoreLabel.setText(highScoreText)
        } else {
            this.highScoreLabel = this.add.bitmapText(0, constants.NotchOffset + 4, "nokia16", highScoreText, 16)
            this.highScoreLabel.setDepth(constants.zLevels.ui)

            const settings = getUserSettings()
            this.highScoreIcon = new BirdSprite(this, constants.GameWidth - 20, 12 + constants.NotchOffset, {
                isPlayer: false,
                settings: settings
            })
            this.highScoreIcon.actAsUIElement()
        }
        rightAlignTextLabel(this.highScoreLabel, 26)
    }

    updateScoreLabel() {
        if (!devSettings.showUI) return
        if (!this.scoreLabel) return

        this.scoreLabel.text = `${this.score}`
        this.scoreLabel.setCenterAlign()
        centerAlignTextLabel(this.scoreLabel, -2)

        if (this.highScoreLabel && this.score > this.highScore) {
            this.highScore = this.score
            setHighScore(this.seed, this.score)
            this.renderHighScores()
        }
    }

    setupPhysicsFloor() {
        /** the physics floor, so that the bus + bird can land on it */
        this.floorPhysics = this.physics.add.staticImage(
            80,
            constants.GameAreaHeight - 42 + constants.GameAreaTopOffset,
            "invis"
        )
        this.floorPhysics.setGravityY(-1 * constants.gravity)
        this.floorPhysics.body.setSize(constants.GameWidth, 20)
        this.floorPhysics.setBounce(0.3)
    }

    addPipe() {
        this.pipes.push(addRowOfPipes(181, this, this.theme))

        // When we have a bird, add lines to score from
        if (game.showPlayerBird(this.mode)) {
            this.scoreLines.push(addScoreLine(181, this, this.bird))
        }
    }

    playBusCrash() {
        playSound(this, "crash")
    }

    update(timestamp: number) {
        if (this.measuringFps) {
            if (this.runningFpsTally.length === 20) {
                const avgFps = Math.floor(_.mean(this.runningFpsTally))

                if (avgFps < 50) {
                    // Low quality!
                    const deadGhostBirds = this.ghostBirds.splice(0, _.min([this.ghostBirds.length, 60]))
                    this.ghostBirds.forEach(b => b.removeAttire())
                    deadGhostBirds.forEach(b => b.destroy())

                    enableAutoLowQualityMode()
                }

                this.measuringFps = false
            } else if (this.runningFpsTally.length < 20) {
                if (this.lastUpdateTimestamp) {
                    const delta = timestamp - this.lastUpdateTimestamp
                    const fps = 1000 / delta
                    this.runningFpsTally.push(fps)
                }
                this.lastUpdateTimestamp = timestamp
            }
        }

        // Parallax stuff, and moves the ground to the front
        if (!this.bird || !this.bird.isDead) {
            bgUpdateTick()
        }

        // Just applying velocity, pipes have non-integer X values, which causes them to jiggle
        // Naively rounding their x-values down to the nearest int seems to work,
        // although could cause unexpected issues?
        nudgePipesOntoPixelGrid(this.pipes)

        // The time from the start of a run
        const adjustedTime = Math.round(timestamp - this.timestampOffset)

        // Flap if appropriate
        if (this.spacebar && Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.userFlap()
        }

        // Replay all of the actions for the other players
        if (game.showGhostBirds(this.mode)) {
            this.seedData.replays.forEach((input, index) => {
                if (!input.actions) {
                    return
                }

                // Technically, this naive lookup is incorrect.
                // ghostBirds are sorted by score, AND we also remove 40 of 'em in low-quality mode
                // meaning the mapping of a ghost's performance and appearance is basically random.
                // Shrug.
                const ghostBird = this.ghostBirds[index]
                if (!ghostBird) return

                while (input.actions.length > 0 && input.actions[0].timestamp < adjustedTime) {
                    const event = input.actions.shift()
                    if (!event) return

                    if (event.action === "flap") {
                        ghostBird.flap()

                        if (devSettings.autoPlayWithBestReplay && index === 0) {
                            this.userFlap()
                        }
                    } else if (event.action === "sync" && event.value !== undefined) {
                        ghostBird.position.y = event.value + constants.GameAreaTopOffset
                    } else if (event.action === "died") {
                        // If the player isn't dead, then this
                        // bird will now be moving at the pipes speed
                        // off the screen
                        let pipeSpeed = constants.pipeSpeed
                        if (this.bird && this.bird.isDead) pipeSpeed = 0

                        ghostBird.die(-1 * pipeSpeed)
                        this.ghostBirdHasDied()
                    }
                }
            })
        }

        // Player related game logic
        if (game.showPlayerBird(this.mode) && this.bird) {
            //
            // record a sync of the users y position every so often, so that
            // we can make sure that the y positions are consistent with the ghosts
            if (timestamp - this.lastSyncedTimestamp >= constants.timeBetweenYSyncs) {
                this.userInput.push({
                    action: "sync",
                    timestamp: adjustedTime,
                    value: Math.round(this.bird.position.y - constants.GameAreaTopOffset)
                })
                this.lastSyncedTimestamp = timestamp
            }

            // If the bird hits the floor
            if (!devSettings.skipBottomCollision && this.bird.position.y > 168 + constants.GameAreaTopOffset) {
                if (!this.bird.isDead) this.userDied()

                this.bird.hasHitFloor()
            }

            // If somehow they move to the edge fo the screen past pipes
            if (!this.bird.isDead && this.bird.position.x > constants.GameWidth) {
                this.userDied()
            }

            // The collision of your bird and the pipes
            if (!this.bird.isDead && !devSettings.skipPipeCollision) {
                this.bird.checkCollision(this, this.pipes, this.userDied)
            }

            // Score points by checking whether you got halfway
            this.bird.checkCollision(this, this.scoreLines, this.userScored)

            this.bird.updateRelatedSprites({ tight: false })
        }

        // Let the bus collide
        const busCrash = (bus: Phaser.GameObjects.GameObject) => {
            busCrashed(bus as any, this, this.theme)
            if (this.bird && this.bird.isInBus && !this.bird.isDead) {
                this.userDied()
                this.bird.stopBeingInBus()
                this.bird.die(-1 * constants.pipeSpeed)
            }
        }

        if (this.bus) this.physics.overlap(this.bus, this.pipes, busCrash, undefined, this)

        pipeOutOfBoundsCheck(this.pipes)
    }

    ghostBirdHasDied() {
        if (game.shouldRestartWhenAllBirdsAreDead(this.mode)) {
            this.restartTheGame()
        } else {
            this.updatePositionUI()
        }
    }

    updatePositionUI() {
        if (this.bird && this.bird.isDead) return
        if (!this.birdsLeft) return

        const position = this.userPositionAgainstGhosts()
        if (position) {
            this.birdsLeft.text = `${position + 1}/${this.seedData.replays.length + 1}`
        } else if (this.hasOpponents()) {
            // You were actually against other folk
            this.birdsLeft.text = "1st"
            playSound(this, "win")
        } else {
            this.birdsLeft.text = "Solo"
        }
    }

    hasOpponents() {
        return this.seedData.replays.length > 0
    }

    userFlap() {
        // Trying to flap on the main menu is just silly!
        if (this.mode === game.GameMode.Menu) {
            return
        }

        // No dead birds flapping y'hear
        if (this.bird && this.bird.isDead) return

        // Give a delay of 1s so that your sprite is on-screen entirely
        const timestamp = Math.round(this.time.now - this.timestampOffset)
        if (timestamp < 1000) return

        this.userInput.push({ action: "flap", timestamp })

        if (this.bus) this.bus.setDepth(constants.zLevels.oneBelowBird)
        this.bird && this.bird.flap()
        this.analytics.flap()
    }

    userScored(_bird: any, line: any) {
        this.scoreLines.shift()
        line.destroy()
        this.score++
        playSound(this, "point")
        this.updateScoreLabel()

        if (this.score <= 2) {
            this.ghostBirds.forEach(b => b.setOpacityBasedOnScore(this.score))
        }
    }

    userPositionAgainstGhosts() {
        const timestamp = this.time.now - this.timestampOffset
        return this.seedData.replays.filter(r => {
            const death = r.actions.find(a => a.action === "died")
            return death && death.timestamp > timestamp
        }).length
    }

    userDied() {
        const timestamp = this.time.now - this.timestampOffset
        const position = this.userPositionAgainstGhosts()

        this.userInput.push({ action: "died", timestamp })

        // Loop through all the seed data to find out the actual position based on when the bird died

        this.analytics.finishRecording({ score: this.score, position })
        const stats = this.analytics.getResults()

        let uploadPromise: Promise<any> | undefined = undefined

        // Check if they did enough for us to record the run
        // in the future we'll want to show the death animation etc
        if (this.isRecording()) {
            // Store what happened
            analyticsEvent("game_played", stats)

            uploadPromise = uploadReplayForSeed({
                seed: this.seed,
                version: constants.APIVersion,
                mode: this.mode,
                playfabId: PlayFab.getPlayfabId(),
                data: {
                    actions: this.userInput,
                    timestamp: Date.now(),
                    score: this.score
                },
                demo: DEMO,
                position: this.userPositionAgainstGhosts(),
                opponents: this.seedData.replays.length,
                time: Date.now() - this.startTimestamp!
            })
        }

        if (game.usesLives(this.mode)) {
            // This is (currently) only in trial mode
            const newLives = subtractALife(this.seed)
            if (newLives === 0) {
                // TODO: Modal insteadx
                console.log("Out of lives :(")
            }
        }

        if (game.shouldRestartWhenPlayerDies(this.mode)) {
            console.log("Restarting!")
            // Currently only used for the non-exposed Training mode. Shrug.
            this.restartTheGame()
        } else {
            // Could be hitting this on a loop
            if (this.bird && this.bird.isDead) return
            console.log("not in a loop")

            // No more new pipes
            if (this.newPipeTimer) this.newPipeTimer.destroy()
            // Stop the pipes and scores from scrolling
            this.pipes.forEach(pg => pg && pg.setVelocity(0, 0, 0))
            this.scoreLines.forEach(sl => sl && sl.setVelocity(0, 0))

            // Make your bird go through the death animation
            this.bird && this.bird.die()

            // Allow the other birds to continue off screen
            this.ghostBirds.forEach(b => !b.isDead && b.startMovingLeft())

            // Stop the bus from moving with the pipes
            if (this.bus) this.bus.setVelocityX(0)

            // Remove the UI
            // TODO: Fade?
            if (this.scoreLabel) this.scoreLabel.destroy()
            if (this.birdsLeft) this.birdsLeft.destroy()
            if (this.backButton) this.backButton.destroy()

            if (this.mode === game.GameMode.Royale) {
                const deathOverlay = new RoyaleDeath(RoyaleDeathSceneKey, {
                    score: this.score,
                    position,
                    battle: this,
                    totalPlayers: this.seedData.replays.length + 1
                })
                this.scene.add(RoyaleDeathSceneKey, deathOverlay, true)
            } else if (this.mode === game.GameMode.Trial) {
                saveDailyTrialRun(this.score, this.seed)

                const isHighScore = this.score === this.highScore

                const showOverlay = () => {
                    const deathOverlay = new TrialDeath(RoyaleDeathSceneKey, {
                        lives: getLives(this.seed),
                        livesState: livesExtensionStateForSeed(this.seed),
                        battle: this,
                        seed: this.seed,
                        score: this.score,
                        isHighScore
                    })
                    this.scene.add(RoyaleDeathSceneKey, deathOverlay, true)
                }

                if (isHighScore) {
                    // We're showing leaderboard results from PlayFab.
                    // After submitting our latest score, it takes some time (anecdotally ~500ms) for PlayFab to register the new score.
                    // Let's awkwardly wait.
                    if (uploadPromise) {
                        uploadPromise.then(() => {
                            setTimeout(showOverlay, 500)
                        })
                    }
                } else {
                    showOverlay()
                }
            }
        }
    }

    resetGame() {
        this.rng = Seed(this.seed)
        this.userInput = []
        this.ghostBirds = []
        this.pipes = []
        this.scoreLines = []
        this.score = 0
        this.timestampOffset = this.time.now
        this.highScoreLabel = undefined
        this.runningFpsTally = []
    }

    restartTheGame() {
        this.resetGame()
        this.scene.restart()
    }

    prepareForShutdown() {
        // if (this.spacebar) this.spacebar.destroy()
    }

    isRecording() {
        return canRecordScore() && game.shouldRecordScores(this.mode)
    }
}

// Devs should never be recording when they can wrap through the floor or pipes
const canRecordScore = () => {
    return !devSettings.skipBottomCollision && !devSettings.skipPipeCollision
}

// https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number/13627586
export function getNumberWithOrdinal(n: number) {
    var s = ["th", "st", "nd", "rd"],
        v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
}
