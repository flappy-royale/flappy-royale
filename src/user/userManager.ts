import { defaultAttire } from "../attire"
import { unzip, zippedObj } from "../zip"

/** Things that are needed for showing stuff to a user */
export interface PresentationAttire extends Attire {
    /** A text description for the UI  */
    description: string
}

export interface Attire {
    /** Things that are needed for the game */
    fit: "loose" | "tight"
    /** The ID in the cache manager */
    id: string
    /** The url to the url */
    href: string
    /** Is this something that can be used as the base (e.g. represents the whole bird)  */
    base: boolean
}

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
}

export interface UserSettings {
    /** What do we call you? */
    name: string
    /** What do you look like? */
    aesthetics: Aesthetics
    /** Settings just fort royale */
    royale: {
        /**
         * Which index were you last on? The idea being that you will cycle through
         * these indexes so that the last game definitely won't be on the same seed
         */
        seedIndex: number
    }
}

// What it is when you first join
export const defaultSettings: UserSettings = {
    name: "Cappy McCapperson_" + Math.floor(Math.random() * 999999) + 1,
    aesthetics: {
        attire: [defaultAttire]
    },
    royale: {
        // It'll auto-add one when you go into a royale
        seedIndex: -1
    }
}

// localStorage only works with text, so we need to marshall
export const getUserSettings = (): UserSettings =>
    JSON.parse(localStorage.getItem("settings") || JSON.stringify(defaultSettings))

const saveSettings = (settings: UserSettings) => localStorage.setItem("settings", JSON.stringify(settings))

/**  For user forms etc */
export const changeSettings = (settings: Partial<UserSettings>) => {
    const existingSettings = getUserSettings()

    if ("name" in settings) existingSettings.name = settings.name!
    if ("royale" in settings) existingSettings.royale = settings.royale!

    if ("aesthetics" in settings) {
        const base = settings.aesthetics!.attire.filter(a => a.base)
        if (base.length !== 1) throw "Must be one, and only be one base"

        existingSettings.aesthetics = settings.aesthetics!
    }

    saveSettings(existingSettings)
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

/** Will get the seed index + 1 or 0 if it's at the cap */
export const getAndBumpUserCycleSeedIndex = (cap: number) => {
    const settings = getUserSettings()
    if (!settings.royale) settings.royale = defaultSettings.royale

    const newIndex = settings.royale.seedIndex + 1
    const index = newIndex < cap ? newIndex : 0

    changeSettings({ royale: { seedIndex: index } })
    return index
}

/** The stats from all your runs */
export const getUserStatistics = () => {
    const runs = getRoyales()
    const stats = {
        gamesPlayed: runs.length,
        bestScore: 0,
        bestPosition: 500,
        royaleWins: 0,
        birdsBeaten: 0,
        crashes: 0,
        totalTime: 0,
        instaDeaths: 0,
        totalFlaps: 0
    }

    runs.forEach(run => {
        // Highest score
        if (run.score > stats.bestScore) stats.bestScore = run.score

        // Lowest position
        if (run.position < stats.bestPosition) stats.bestPosition = run.position

        // Position = 0, is a win
        if (run.position === 0) stats.royaleWins += 1

        // Birds you've gone past
        stats.birdsBeaten += run.totalBirds - run.position

        // when you didn't get past one pipe
        if (run.score === 0) stats.instaDeaths += 1

        // All time played
        stats.totalTime += run.endTimestamp - run.startTimestamp

        // How many time did you flap
        stats.totalFlaps += run.flaps
    })

    // how many times did you not win
    stats.crashes = stats.gamesPlayed - stats.royaleWins

    return stats
}
