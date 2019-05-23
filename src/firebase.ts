import * as firebase from "firebase"
import { UserSettings } from "./user/userManager"
import { SeedsResponse } from "../functions/src/api-contracts"

export interface PlayerEvent {
    timestamp: number
    action: "flap" | "sync" | "died"
    value?: number
}

export interface PlayerData {
    user: UserSettings
    /** User input actions */
    actions: PlayerEvent[]
    timestamp: number
}

// Offline
const getLocalSeeds = () => ""

const firebaseConfig = {
    apiKey: "AIzaSyCPbIZkuRJSdIVlRCHJPCLlWd6cz6VAs-s",
    authDomain: "flappy-royale-3377a.firebaseapp.com",
    databaseURL: "https://flappy-royale-3377a.firebaseio.com",
    projectId: "flappy-royale-3377a",
    storageBucket: "flappy-royale-3377a.appspot.com",
    messagingSenderId: "533580149860",
    appId: "1:533580149860:web:7be6631222f08df3"
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

export class FirebaseDataStore {
    data: { [key: string]: PlayerData[] }

    apiVersion: string

    app: firebase.app.App
    ref: firebase.database.Reference

    constructor(apiVersion: string) {
        // Initialize Firebase

        this.apiVersion = apiVersion
        this.app = firebase.initializeApp(firebaseConfig)
        this.ref = firebase.database().ref()
        this.data = {}
    }

    fetch(seed: string) {
        return new Promise((resolve, reject) => {
            this.ref
                .child(`recordings/${this.apiVersion}/${seed}`)
                .once("value")
                .then(snapshot => {
                    // Firebase doesn't store arrays of data, it stores objects whose keys are random IDs
                    // This garbage soup is just to mangle that into an array.
                    const result: { [key: string]: PlayerData } = {}
                    const snap = snapshot.val()
                    if (!snap) {
                        resolve({})
                        return
                    }

                    this.data[seed] = Object.values(snap)
                    resolve(result)
                })
        })
    }

    storeForSeed(seed: string, data: PlayerData) {
        this.ref.child(this.pathForSeed(seed)).push(data)
    }

    private pathForSeed(seed: string): string {
        return `recordings/${this.apiVersion}/${seed}`
    }
}
