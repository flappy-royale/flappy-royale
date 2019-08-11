import { PresentationAttire } from "../attire"
import { defaultAttireSet } from "./defaultAttireSet"
import { dangerAttireSet } from "./dangerAttireSet"
import { happyChapAttireSet } from "./happyChapAttireSet"

export interface AttireSet {
    /** Displayed at the top */
    name: string

    /** Unique ID used in PlayFab. Will stay constant, as name might change  */
    id: string

    /** Displayed on the egg, and on the tabs */
    iconPath: string

    /** Who should we say built this */
    attributedTo: string

    /** Provide a link back to them */
    attributedURL: string

    lightHexColor: string
    darkHexColor: string

    /** Stuff in the box */
    attire: PresentationAttire[]
}

/** Each available set of attire you could use  */
export const allAttireSets = [defaultAttireSet, dangerAttireSet, happyChapAttireSet]

/** All of the attire available in the game ATM */
export const allAttireInGame = [...defaultAttireSet.attire, ...dangerAttireSet.attire, ...happyChapAttireSet.attire]

const allAttireKeyedByUUID = {} as { [index: number]: PresentationAttire }
const allAttireKeyedByID = {} as { [index: string]: PresentationAttire }

allAttireInGame.forEach(attire => {
    allAttireKeyedByUUID[attire.uuid] = attire
    allAttireKeyedByID[attire.id] = attire
})

// > let a = {}
// undefined
// > a[1] = "123"
// '123'
// > a["1"]
// '123'
// > a[1]
// '123'
/** Quickly goes from 1 -> "hedgehog" */
export const convertAttireUUIDToID = (uuid: string | number) => allAttireKeyedByUUID[uuid as any].id
/** Quickly goes from hedgehog -> 1 */
export const convertAttireIDToUUID = (id: string) => allAttireKeyedByID[id].uuid
