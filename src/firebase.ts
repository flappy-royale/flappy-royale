import * as firebase from "firebase"

export interface PlayerEvent {
    timestamp: number
    action: "flap" | "sync" | "died"
    value?: number
}

export interface PlayerData {
    name: string
    apiVersion: string
    actions: PlayerEvent[]
}

export class FirebaseDataStore {
    data?: { [seed: string]: PlayerData[] }

    apiVersion: string

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
        firebase.initializeApp(firebaseConfig)
        this.ref = firebase.database().ref()
    }

    fetch() {
        console.log(this)
        return new Promise((resolve, reject) => {
            this.ref
                .child(`recordings/${this.apiVersion}`)
                .once("value")
                .then(snapshot => {
                    // Firebase doesn't store arrays of data, it stores objects whose keys are random IDs
                    // This garbage soup is just to mangle that into an array.

                    const result: { [seed: string]: PlayerData[] } = {}

                    const snap = snapshot.val()
                    if (!snap) {
                        resolve({})
                        return
                    }

                    Object.keys(snap).forEach(key => {
                        result[key] = []
                        Object.keys(snap[key]).forEach(id => {
                            result[key].push(snap[key][id])
                        })
                    })

                    this.data = result
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
