interface Aesthetics {
    // Strings of stored keys for hats
    // will need to change if we support dynamic attire without shipping the images in-app
    attire: string[]
    // It's a guess for now
    baseColor: string
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

interface GlobalUserSettings {
    /** What do we call you? */
    name: string

    /** What do you look like? */
    aesthetics: Aesthetics

    /** Every royale game completed, we want to store one of these */
    royales: GameResults[]
}

// What it is when you first join
const defaultSettings: GlobalUserSettings = {
    name: "Cappy McCapperson_" + Math.floor(Math.random() * 999999) + 1,
    royales: [],
    aesthetics: {
        attire: [],
        baseColor: "eeffee"
    }
}

// localStorage only works with text, so we need to marshall
const getSettings = (): GlobalUserSettings =>
    JSON.parse(localStorage.getItem("settings") || JSON.stringify(defaultSettings))

const saveSettings = (settings: GlobalUserSettings) => localStorage.setItem("settings", JSON.stringify(settings))

/**  For user forms etc */
export const changeSettings = (settings: { name?: string }) => {
    const existingSettings = getSettings()
    if ("name" in settings) {
        existingSettings.name = settings.name
    }
    saveSettings(existingSettings)
}

/**  For the end of a run */
export const recordGamePlayed = (results: GameResults) => {
    const existingSettings = getSettings()
    existingSettings.royales.push(results)
    saveSettings(existingSettings)
}
