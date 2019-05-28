import { defaultAttire } from "../attire"

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
    // How many flaps did it take to win
    flaps: number
    // How many pipes did they get past?
    score: number
    // What did you look like?
    aesthetics: Aesthetics
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

// The royales are separated from the settings because it just felt a bit naff passing them around for no reason
export const getRoyales = (): GameResults[] => JSON.parse(localStorage.getItem("royales") || JSON.stringify([]))

/**  For the end of a run */
export const recordGamePlayed = (results: GameResults) => {
    const existingRoyales = getRoyales()
    existingRoyales.push(results)
    localStorage.setItem("royales", JSON.stringify(existingRoyales))
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
