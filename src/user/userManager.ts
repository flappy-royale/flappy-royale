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

interface UserSettings {
    /** What do we call you? */
    name: string

    /** What do you look like? */
    aesthetics: Aesthetics
}

// What it is when you first join
const defaultSettings: UserSettings = {
    name: "Cappy McCapperson_" + Math.floor(Math.random() * 999999) + 1,
    aesthetics: {
        attire: [],
        baseColor: "eeffee"
    }
}

// localStorage only works with text, so we need to marshall
const getSettings = (): UserSettings => JSON.parse(localStorage.getItem("settings") || JSON.stringify(defaultSettings))
const saveSettings = (settings: UserSettings) => localStorage.setItem("settings", JSON.stringify(settings))

/**  For user forms etc */
export const changeSettings = (settings: { name?: string }) => {
    const existingSettings = getSettings()
    if ("name" in settings) {
        existingSettings.name = settings.name
    }
    saveSettings(existingSettings)
}

// The royales are separated from the settings because it just felt a bit naff passing them around for no reason

const getRoyales = (): GameResults[] => JSON.parse(localStorage.getItem("royales") || JSON.stringify([]))

/**  For the end of a run */
export const recordGamePlayed = (results: GameResults) => {
    const existingRoyales = getRoyales()
    existingRoyales.push(results)
    localStorage.setItem("royales", JSON.stringify(existingRoyales))
}
