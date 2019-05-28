import * as firebase from "firebase"
import { UserSettings } from "./user/userManager"
import { SeedsResponse } from "../functions/src/api-contracts"
import { ReplayUploadRequest } from "../functions/src"

export interface SeedData {
    users: PlayerData[]
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

export const firebaseConfig = {
    apiKey: "AIzaSyCPbIZkuRJSdIVlRCHJPCLlWd6cz6VAs-s",
    authDomain: "flappy-royale-3377a.firebaseapp.com",
    databaseURL: "https://flappy-royale-3377a.firebaseio.com",
    projectId: "flappy-royale-3377a",
    storageBucket: "flappy-royale-3377a.appspot.com",
    messagingSenderId: "533580149860",
    appId: "1:533580149860:web:7be6631222f08df3"
}

const firebaseApp = firebase.initializeApp(firebaseConfig)
firebaseApp.firestore().enablePersistence()

export const fetchRecordingsForSeed = async (seed: string): Promise<SeedData> => {
    const dataRef = await firebaseApp
        .firestore()
        .collection("recordings")
        .doc(seed)
        .get()

    const seeds = (dataRef.data() as any) || emptySeedData
    return seeds
}

// prettier-ignore
/**
 * Grabs a copy of the seeds from a google function which ensures we have consistent seeds.
 * It's expected that this would be called every time you see the main menu.
 *
 * Call it will have the side-effect of saving your seeds into local cache, so that if the
 * app opens up offline you've got something to work with.
 */
export const getSeedsFromAPI = (apiVersion: string) => fetch(`https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/seeds?version=${apiVersion}`)
    .then(r => r.json() as Promise<SeedsResponse | undefined>)
    .then(seeds => {
        // Store a local copy of the seeds
        localStorage.setItem("lastSeeds", JSON.stringify({
            apiVersion, seeds
        }))
        console.log("Got seeds!", apiVersion, seeds)
        return seeds
    }).catch(e => {
        console.log("Could not fetch seeds, falling back to local cache", e)
        return getLocallyStoredSeeds(apiVersion)
    })

export const getLocallyStoredSeeds = (apiVersion): SeedsResponse | undefined => {
    const stringResult = localStorage.getItem("lastSeeds")
    const result = JSON.parse(stringResult)

    if (result && result.apiVersion === apiVersion) {
        return result.seeds
    }
}

export const uploadReplayForSeed = (replay: ReplayUploadRequest) => {
    return fetch(`https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/addReplayToSeed`, {
        method: "POST",
        body: JSON.stringify(replay)
    })
}

/** Used in training */
export const emptySeedData: SeedData = { users: [] }
