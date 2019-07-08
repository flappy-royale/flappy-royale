import { defaultAttire, Attire } from "../attire"
import { unzip, zippedObj } from "../zip"
import _ = require("lodash")
import { GameMode } from "../battle/utils/gameMode"
import { getSeeds } from "../firebase"
import { APIVersion } from "../constants"
import * as PlayFab from "../playFab"

interface Aesthetics {
    // Strings of stored keys for hats
    // will need to change if we support dynamic attire without shipping the images in-app
    attire: Attire[]
}

export interface GameResults {
    // When the game started
    startTimestamp: number
    // When the game finished
    endTimestamp: number
    // What was the users score
    position: number
    // How many birds were there?
    totalBirds: number
    // How many flaps did it take to win
    flaps: number
    // How many pipes did they get past?
    score: number
    // Which game mode was this recorded in?
    mode: GameMode
}

export interface Bird {
    /** What do we call you? */
    name: string
    /** What do you look like? */
    aesthetics: Aesthetics
}

export interface UserSettings extends Bird {
    /** Settings just fort royale */
    royale: {
        /**
         * Which index were you last on? The idea being that you will cycle through
         * these indexes so that the last game definitely won't be on the same seed
         */
        seedIndex: number
    }

    /** Whether or not the player has been asked if they know how to play onboarding */
    hasAskedAboutTutorial: boolean
}

export interface PlayerStats {
    gamesPlayed: number
    bestScore: number
    bestPosition: number
    royaleWins: number
    trialWins: number
    birdsBeaten: number
    crashes: number
    totalTime: number
    instaDeaths: number
    totalFlaps: number

    /** All scores added together */
    totalScore: GameMode

    /** The user's current royale streak
     * (number of consecutive royale wins without a loss)*/
    royaleStreak: number

    /** The user's all-time highest royale streak */
    bestRoyaleStreak: number
}

// Which user settings keys — other than 'name' and 'aesthetics' – we want to sync on PlayFab
export const syncedSettingsKeys = ["hasAskedAboutTutorial"]

// What it is when you first join
export const defaultSettings: UserSettings = {
    name: "new player",
    aesthetics: {
        attire: [defaultAttire]
    },
    royale: {
        // It'll auto-add one when you go into a royale
        seedIndex: -1
    },
    hasAskedAboutTutorial: false
}

// localStorage only works with text, so we need to marshall
export const getUserSettings = (): UserSettings =>
    JSON.parse(localStorage.getItem("settings") || JSON.stringify(defaultSettings))

const saveSettings = (settings: UserSettings) => {
    localStorage.setItem("settings", JSON.stringify(settings))
    PlayFab.updateUserSettings(settings)
}

/**  For user forms etc */
export const changeSettings = (settings: Partial<UserSettings>) => {
    const existingSettings = getUserSettings()

    if ("name" in settings) {
        existingSettings.name = settings.name!
    }
    if ("royale" in settings) existingSettings.royale = settings.royale!
    if ("hasAskedAboutTutorial" in settings) existingSettings.hasAskedAboutTutorial = settings.hasAskedAboutTutorial!

    if ("aesthetics" in settings) {
        const base = settings.aesthetics!.attire.filter(a => a.base)
        if (base.length !== 1) throw "Must be one, and only be one base"

        existingSettings.aesthetics = settings.aesthetics!
    }

    saveSettings(existingSettings)
}

// Fetches user settings (just like getUserSettings), but guarantees we've already finished login and thus synced data from the server
export const getSyncedUserSettings = async (): Promise<UserSettings> => {
    await PlayFab.loginPromise
    return getUserSettings()
}

// The royales are separated from the settings because they can get pretty big
// just felt a bit naff passing them around for no reason
//
export const getRoyales = (): GameResults[] => {
    const existingData = localStorage.getItem("royales")
    if (!existingData) return []
    try {
        return unzip(existingData) || []
    } catch (error) {
        console.log("empty")
        return []
    }
}

/**  For the end of a run */
export const recordGamePlayed = (results: GameResults) => {
    const existingRoyales = getRoyales()
    existingRoyales.push(results)

    const zippedRoyales = zippedObj(existingRoyales)
    localStorage.setItem("royales", zippedRoyales)
}

/** Daily trial runs when you're lower than your previous best */

export interface DailyTrialRun {
    score: number
    timestamp: Date // Date.toJSON()
}

const dailyTrialStorageKey = "dailyTrialRuns"

export const saveDailyTrialRun = (score: number, seed: string) => {
    const run = {
        score,
        timestamp: new Date()
    }

    let runs = [...getDailyTrialRuns(seed), run]
    const data = { runs, seed }

    localStorage.setItem(dailyTrialStorageKey, JSON.stringify(data))
}

export const getDailyTrialRuns = (seed: string): DailyTrialRun[] => {
    let rawData = localStorage.getItem(dailyTrialStorageKey)
    if (!rawData) return []

    let data = JSON.parse(rawData)
    if (!data || data.seed !== seed) return []

    // JSON.parse()-ing an object containing Date.toJSON() strings doesn't return rehydrated Date objects
    return data.runs.map((r: { score: number; timestamp: string }) => {
        return {
            score: r.score,
            timestamp: new Date(r.timestamp)
        }
    })
}

/** Will get the seed index + 1 or 0 if it's at the cap */
export const getAndBumpUserCycleSeedIndex = (cap: number): number => {
    const settings = getUserSettings()
    if (!settings.royale) settings.royale = defaultSettings.royale

    const newIndex = settings.royale.seedIndex + 1
    const index = newIndex < cap ? newIndex : 0

    changeSettings({ royale: { seedIndex: index } })
    return index
}

export const getAndBumpUserCycleSeed = async (): Promise<string> => {
    const seeds = await getSeeds(APIVersion, true)
    if (!seeds) return "" // TODO: Better handle the case where there's neither network access nor cached seed data

    const newIndex = getAndBumpUserCycleSeedIndex(seeds.royale.length)
    return seeds.royale[newIndex]
}

/** The stats from all your runs */
export const getUserStatistics = (): PlayerStats => {
    // Sorted ascending by time so we can easily calculate royale streak
    const runs = getRoyales().sort((r1, r2) => r1.startTimestamp - r2.startTimestamp)

    const stats = {
        gamesPlayed: runs.length,
        bestScore: 0,
        bestPosition: 500,
        royaleWins: 0,
        trialWins: 0,
        birdsBeaten: 0,
        crashes: 0,
        totalTime: 0,
        instaDeaths: 0,
        totalFlaps: 0,
        royaleStreak: 0,
        bestRoyaleStreak: 0,
        totalScore: 0
    }

    let currentRoyaleStreak = 0

    runs.forEach(run => {
        // Highest score
        if (run.score > stats.bestScore) stats.bestScore = run.score

        // Lowest position
        if (run.position < stats.bestPosition && run.totalBirds > 0) stats.bestPosition = run.position

        // Position = 0, is a win
        if (run.position === 0 && run.mode === GameMode.Royale && run.totalBirds > 0) stats.royaleWins += 1

        // So we can separately say how many trial wins you have
        if (run.position === 0 && run.mode == GameMode.Trial) stats.trialWins += 1

        if (run.mode === GameMode.Royale) {
            if (run.position === 0 && run.totalBirds > 0) {
                currentRoyaleStreak += 1
                if (currentRoyaleStreak > stats.bestRoyaleStreak) {
                    stats.bestRoyaleStreak = currentRoyaleStreak
                }
            } else {
                currentRoyaleStreak = 0
            }
        }

        // Birds you've gone past
        stats.birdsBeaten += run.totalBirds - run.position

        // when you didn't get past one pipe
        if (run.score === 0) stats.instaDeaths += 1

        // All time played
        stats.totalTime += run.endTimestamp - run.startTimestamp

        // How many time did you flap
        stats.totalFlaps += run.flaps

        // "You have score 2000 points"
        stats.totalScore += run.score
    })

    stats.royaleStreak = currentRoyaleStreak

    // how many times did you not win
    stats.crashes = stats.gamesPlayed - (stats.royaleWins + stats.trialWins)

    return stats
}

const defaultLives = 10

export const getLives = (seed: string): number => {
    const livesData = localStorage.getItem("lives")

    let livesNum = livesData && JSON.parse(livesData)[seed]
    if (livesNum === undefined || livesNum === null) livesNum = defaultLives

    // Cleans up old lives data every time you grab one,
    // mainly just keeps the amount of space in localstorage small
    const newData = { [seed]: livesNum }
    localStorage.setItem("lives", JSON.stringify(newData))

    return livesNum
}

export const getHighScore = (seed: string): number => {
    const highScoreData = localStorage.getItem("highScore")

    let scoreNum = highScoreData && JSON.parse(highScoreData)[seed]

    if (!scoreNum) {
        const newData = { [seed]: 0 }
        localStorage.setItem("highScore", JSON.stringify(newData))
    }

    return scoreNum || 0
}

export const setHighScore = (seed: string, score: number) => {
    // Warning: This doesn't verify that the high score is actually higher than the old one!
    const data = { [seed]: score }
    localStorage.setItem("highScore", JSON.stringify(data))
}

export const subtractALife = (seed: string) => addLives(seed, -1)

export const addLives = (seed: string, val: number): number => {
    const livesData = localStorage.getItem("lives")

    let lives = livesData && JSON.parse(livesData)[seed]
    if (_.isUndefined(lives)) {
        lives = defaultLives
    }

    const newData = { [seed]: lives + val }
    localStorage.setItem("lives", JSON.stringify(newData))

    return newData[seed]
}

export enum LifeStateForSeed {
    FirstSet, // Not seen any ads today
    ExtraFive, // Gone through first set
    ExtraTen,
    ExtraFifteen
}

/** Get the current state of whether you've got extra lives for particular seed */
export const livesExtensionStateForSeed = (seed: string): LifeStateForSeed => {
    const highScoreData = localStorage.getItem("lives-state")

    let scoreNum = highScoreData && JSON.parse(highScoreData)[seed]

    if (scoreNum === undefined || scoreNum === null) {
        const newData = { [seed]: 0 }
        localStorage.setItem("lives-state", JSON.stringify(newData))
    }

    return scoreNum || LifeStateForSeed.FirstSet
}

export const livesExtensionsButtonTitleForState = (state: LifeStateForSeed): string => {
    const map = {
        [LifeStateForSeed.FirstSet]: "+5 tries",
        [LifeStateForSeed.ExtraFive]: "+10 tries",
        [LifeStateForSeed.ExtraTen]: "+15 tries",
        [LifeStateForSeed.ExtraFifteen]: "out of tries"
    }

    return map[state]
}

/** Moves up through the enum above */
export const bumpLivesExtensionState = (seed: string) => {
    const livesData = localStorage.getItem("lives-state")
    const state = (livesData && JSON.parse(livesData)[seed]) || LifeStateForSeed.FirstSet

    const newData = { [seed]: state + 1 }
    localStorage.setItem("lives-state", JSON.stringify(newData))
}

export const hasAskedAboutTutorial = () => {
    changeSettings({ hasAskedAboutTutorial: true })
}

export const hasName = () => {
    const settings = getUserSettings()
    return settings.name && settings.name !== "new player"
}
