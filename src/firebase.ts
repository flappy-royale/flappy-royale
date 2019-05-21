import * as firebase from "firebase"
import { UserSettings } from "./user/userManager"

export interface PlayerEvent {
    timestamp: number
    action: "flap" | "sync" | "died"
    value?: number
}

export interface PlayerData {
    apiVersion: string
    user: UserSettings
    /** User input actions */
    actions: PlayerEvent[]
    timestamp: number
}

export class FirebaseDataStore {
    data: { [key: string]: PlayerData[] }

    apiVersion: string

    app: firebase.app.App
    ref: firebase.database.Reference

    constructor(apiVersion: string) {
        var firebaseConfig = {
            apiKey: "AIzaSyCPbIZkuRJSdIVlRCHJPCLlWd6cz6VAs-s",
            authDomain: "flappy-royale-3377a.firebaseapp.com",
            databaseURL: "https://flappy-royale-3377a.firebaseio.com",
            projectId: "flappy-royale-3377a",
            storageBucket: "flappy-royale-3377a.appspot.com",
            messagingSenderId: "533580149860",
            appId: "1:533580149860:web:7be6631222f08df3"
        }
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
        if (data.apiVersion != this.apiVersion) {
            throw `Attempting to store data with a different API version than the API client: ${data.apiVersion} vs ${
                this.apiVersion
            }`
        }
        this.ref.child(this.pathForSeed(seed)).push(data)
    }

    private pathForSeed(seed: string): string {
        return `recordings/${this.apiVersion}/${seed}`
    }
}
