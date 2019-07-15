import { Attire } from "../attire"

export interface Aesthetics {
    // Strings of stored keys for hats
    // will need to change if we support dynamic attire without shipping the images in-app
    attire: Attire[]
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
    // An array of IDs
    unlockedAttire: string[]
}
