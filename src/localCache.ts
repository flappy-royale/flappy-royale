import { SeedsResponse } from "../functions/src/api-contracts"
import { JsonSeedData } from "./firebase"
import _ = require("lodash")
import * as uuid from "uuid/v4"

// For now, the API returns at most 50 royale seeds, plus one daily
// (a comment is a promise waiting to be broken, etc)
const maxRecordingCount = 51

export const cache = {
    setRecordings: (seed: string, data: JsonSeedData) => {
        // The list is a FIFO queue of seed keys for recordings.
        // Items have individual expirations, so we start by clearing out any items that have expired.
        // After that, if we have more recordings than we want, get rid of the oldest ones we have
        // (note: "oldest" is currently based on creation time, not update time. This may cause problems, but this is simplest for now!)

        let list: string[][] = []
        const recordingListData = localStorage.allRecordings
        if (recordingListData) {
            list = JSON.parse(recordingListData)
        }

        if (_.isString(list[0])) {
            // If the list is just seeds, rather than seed/expiry tuples, it's an old data format. Wipe out the cache entirely!
            let oldList: string[] = (list as unknown) as string[]
            oldList.forEach(localStorage.removeItem)
            list = []
        }

        list = list.filter(i => {
            const expiry = new Date(i[2])
            return expiry >= new Date()
        })

        list.unshift([`replays-${seed}`, data.expiry])

        if (list.length > maxRecordingCount) {
            // `Array::splice` is mutating.
            // It returns all elements over the index, but mutates the array to contain everything before them
            // So, in our case, `list` will now be at most `maxRecordingCount` items long

            const diff = list.splice(maxRecordingCount)
            diff.forEach(d => localStorage.removeItem(d[0]))
            localStorage.allRecordings = JSON.stringify(list)
        }

        localStorage[`replays-${seed}`] = JSON.stringify(data)
    },

    getRecordings: (seed: String): JsonSeedData | undefined => {
        const data = localStorage[`replays-${seed}`]
        if (data) {
            return JSON.parse(data)
        }
        return undefined
    },

    setSeeds: (apiVersion: string, seeds: SeedsResponse) => {
        localStorage.setItem("lastSeeds", JSON.stringify({ apiVersion, seeds }))
    },

    getSeeds: (apiVersion: string): SeedsResponse | undefined => {
        const stringResult = localStorage.lastSeeds
        if (!stringResult) return undefined

        const result = JSON.parse(stringResult)

        if (result && result.apiVersion === apiVersion) {
            return result.seeds
        }

        return undefined
    },

    /** Always returns the same UUID for a given user / app ID */
    getUUID: (appId: string): string => {
        const stored = localStorage.getItem("uuid")
        if (stored) {
            return stored
        }

        const generated = uuid()
        localStorage.setItem("uuid", generated)
        return generated
    }
}
