import * as firebase from "firebase"
import { UserSettings } from "./user/userManager"
import { SeedsResponse } from "../functions/src/api-contracts"

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

export const fetchRecordingsForSeed = async (seed: string): Promise<SeedData> => {
    const dataRef = await firebaseApp
        .firestore()
        .collection("recordings")
        .doc(seed)
        .get()

    return dataRef.data() as any
}

export const storeForSeed = (meta: { seed: string; create: boolean }, data: PlayerData) => {
    const db = firebaseApp.firestore()
    const batch = db.batch()
    const recordings = db.collection("recordings")
    const seedDoc = recordings.doc(meta.seed)
    if (meta.create) {
        const toUpload: SeedData = { users: [data] }
        batch.set(seedDoc, toUpload)
    } else {
        console.log("Updating")
        batch.update(seedDoc, { users: firebase.firestore.FieldValue.arrayUnion(data) })
    }

    return batch.commit()
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
                                                  .then(r => r.json() as Promise<SeedsResponse>)
                                                  .then(seeds => {
                                                      // Store a local copy of the seeds
                                                    localStorage.setItem("lastSeeds", JSON.stringify(seeds))
                                                    return seeds
                                                  })

export const getLocallyStoredSeeds = (): SeedsResponse | undefined =>
    localStorage.getItem("lastSeeds") && JSON.parse(localStorage.getItem("lastSeeds"))

/** Used in training */
export const emptySeedData: SeedData = { users: [] }
