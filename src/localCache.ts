import { SeedsResponse } from "../functions/src/api-contracts"
import { SeedData, emptySeedData } from "./firebase"

// For now, the API returns at most 50 royale seeds, plus one daily
// (a comment is a promise waiting to be broken, etc)
const maxRecordingCount = 51

export const cache = {
    setRecordings: (seed: string, data: SeedData) => {
        // The list is a FIFO queue of seed keys for recordings.
        // If we have more recordings than we want, get rid of the oldest ones we have
        // (note: "oldest" is currently based on creation time, not update time. This may cause problems, but this is simplest for now!)

        let list: string[] = []
        const recordingListData = localStorage.recordingList
        if (recordingListData) {
            list = JSON.parse(recordingListData)
        }

        list.unshift(seed)

        if (list.length > maxRecordingCount) {
            // `Array::splice` is mutating.
            // It returns all elements over the index, but mutates the array to contain everything before them
            // So, in our case, `list` will now be at most `maxRecordingCount` items long

            const diff = list.splice(maxRecordingCount)
            diff.forEach(localStorage.removeItem)
            localStorage.recordingList = list
        }

        localStorage[`recordings-${seed}`] = JSON.stringify(data)
    },

    getRecordings: (seed: String): SeedData => {
        const data = localStorage[`recordings-${seed}`]
        if (data) {
            return JSON.parse(data)
        } else {
            return emptySeedData
        }
    },

    setSeeds: (apiVersion: string, seeds: SeedsResponse) => {
        // localStorage.setItem("lastSeeds", JSON.stringify({
        //   apiVersion, seeds
        // }))
    },

    getSeeds: (apiVersion: string): SeedsResponse | undefined => {
        const stringResult = localStorage.lastSeeds
        const result = JSON.parse(stringResult)

        if (result && result.apiVersion === apiVersion) {
            return result.seeds
        }
    }
}
