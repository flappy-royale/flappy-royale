import { Attire, PresentationAttire } from "../attire"
import { defaultAttireSet } from "./defaultAttire"

export interface AttireSet {
    /** Displayed at the top */
    name: string

    /** Unique ID used in PlayFab. Will stay constant, as name might change  */
    id: string

    /** Displayed on the egg, and on the tabs */
    iconPath: string

    /** Who should we say built this */
    attributedTo: string
    attributedURL: string

    lightHexColor: string
    darkHexColor: string

    /** Stuff in the box */
    attire: PresentationAttire[]
}

/** Each available set of attire you could use  */
export const allAttireSets = [defaultAttireSet]

/** All of the attire available in the game ATM */
export const allAttireInGame = [...defaultAttireSet.attire]
