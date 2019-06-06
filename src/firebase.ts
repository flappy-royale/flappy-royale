import * as firebase from "firebase/app"
import "firebase/firestore"

import { UserSettings } from "./user/userManager"
import { SeedsResponse } from "../functions/src/api-contracts"
import { ReplayUploadRequest } from "../functions/src"
import { cache } from "./localCache"
import { unzip } from "./zip"
import { firebaseConfig } from "../assets/config/firebaseConfig"

/** How it's stored in the DB to save on fs space */
export interface SeedDataZipped {
    replaysZipped: string
}

/** How it's unzipped in the client */
export interface SeedData {
    replays: PlayerData[]
}

export interface PlayerData {
    user: UserSettings
    /** User input actions */
    actions: PlayerEvent[]
    timestamp: number
    score: number
}

export interface PlayerEvent {
    timestamp: number
    action: "flap" | "sync" | "died"
    value?: number
}

const firebaseApp = firebase.initializeApp(firebaseConfig)

export const fetchRecordingsForSeed = async (seed: string): Promise<SeedData> => {
    try {
        const dataRef = await firebaseApp
            .firestore()
            .collection("recordings")
            .doc(seed)
            .get()

        const seedData = dataRef.data() as SeedDataZipped
        if (!seedData) {
            return emptySeedData
        }

        const seeds = unzipSeedData(seedData)
        console.log(`Fetched recordings from server for seed ${seed}`, seeds)
        try {
            cache.setRecordings(seed, seeds)
        } catch (error) {}
        return seeds
    } catch (e) {
        console.log("Could not fetch recordings over the network. Falling back on local cache", e)
        console.log(cache.getRecordings(seed))
        return cache.getRecordings(seed)
    }
}

/**
 * Grabs a copy of the seeds from a google function which ensures we have consistent seeds.
 * It's expected that this would be called every time you see the main menu.
 *
 * Call it will have the side-effect of saving your seeds into local cache, so that if the
 * app opens up offline you've got something to work with.
 */
export const getSeedsFromAPI = (apiVersion: string) => {
    return fetch(`https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/seeds?version=${apiVersion}`)
        .then(r => r.json() as Promise<SeedsResponse | undefined>)
        .then(seeds => {
            // Store a local copy of the seeds
            cache.setSeeds(apiVersion, seeds)
            console.log("Got seeds from server", apiVersion, seeds)
            return seeds
        })
        .catch(e => {
            console.log("Could not fetch seeds, falling back to local cache", e)
            return cache.getSeeds(apiVersion)
        })
}

export const uploadReplayForSeed = (replay: ReplayUploadRequest) => {
    return fetch(`https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/addReplayToSeed`, {
        // return fetch(`http://localhost:5000/${firebaseConfig.projectId}/us-central1/addReplayToSeed`, {
        method: "POST",
        body: JSON.stringify(replay)
    })
}

/** Used in training */
export const emptySeedData: SeedData = { replays: [] }

/**
 * Converts from the db representation where the seed data is gzipped into
 * a useable model JSON on the client
 */
export const unzipSeedData = (seed: SeedDataZipped): SeedData => {
    return {
        replays: unzip(seed.replaysZipped)
    }
}
