import * as functions from "firebase-functions"
import { SeedsResponse } from "./api-contracts"
import * as admin from "firebase-admin"

const numberOfDifferentRoyaleReplays = 50
const maxNumberOfReplays = 250

// So we can access the db
admin.initializeApp()

/** Gets a consistent across all API versions seed for a day */
export const dailySeed = (version: string, offset: number) => {
    const date = new Date()
    return `${version}-${date.getFullYear()}-${date.getMonth()}-${date.getDate() + offset}`
}

/** Gets a consistent across all API versions seed for an hour */
export const hourlySeed = (version: string, offset: number) => {
    const date = new Date()
    return `${version}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours() + offset}}`
}

export const seeds = functions.https.onRequest((request, response) => {
    const version = request.query.version || request.params.version
    const responseJSON: SeedsResponse = {
        royale: [...Array(numberOfDifferentRoyaleReplays).keys()].map(i => `${version}-royale-${i}`),
        daily: {
            dev: dailySeed(version, 2),
            staging: dailySeed(version, 1),
            production: dailySeed(version, 0)
        },
        hourly: {
            dev: hourlySeed(version, 2),
            staging: hourlySeed(version, 1),
            production: hourlySeed(version, 0)
        }
    }
    response
        .status(200)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        .send(responseJSON)
})

export interface ReplayUploadRequest {
    uuid?: string
    version: string
    seed: string
    data: import("../../src/firebase").PlayerData
}

export const addReplayToSeed = functions.https.onRequest(async (request, response) => {
    // Ensure CORS is cool
    response
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

    const { seed, uuid, version, data } = JSON.parse(request.body) as ReplayUploadRequest

    if (!uuid) {
        return response.status(400).send({ error: "Needs a uuid in request" })
    }
    if (!version) {
        return response.status(400).send({ error: "Needs a version in request" })
    }
    if (!data) {
        return response.status(400).send({ error: "Needs a data of type PlayerData in request" })
    }

    const db = admin.firestore()
    const recordings = db.collection("recordings")
    const dataRef = await recordings.doc(seed)
    const seedData = (await dataRef.get()).data() as import("../../src/firebase").SeedData

    if (!seedData) {
        // We need too make the data
        await dataRef.set({ users: [data] }) 
    } else {
        // We need to amend the data instead
        const existingCount = seedData.users.length
        const shouldUpdateNotAdd = existingCount < maxNumberOfReplays


        // We want to cap the number of recordings overall
        if (shouldUpdateNotAdd) {
            // TODO: Add a UUID to the user?
            const hasUserInData = seedData.users.findIndex(d => d.user.name == uuid)
            const randomIndexToDrop = Math.floor(Math.random() * existingCount)
            const index = hasUserInData !== -1 ? hasUserInData : randomIndexToDrop
            seedData.users[index] = data
        } else {
            seedData.users.push(data)
        }

        dataRef.set({ users: seedData.users })
    }

    const responseJSON = { success: true }
    return response.status(200).send(responseJSON)
})
