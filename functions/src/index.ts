import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { SeedsResponse } from "./api-contracts"
import * as pako from "pako"
import { SeedDataZipped, SeedData } from "../../src/firebase"

const numberOfDifferentRoyaleReplays = 3
const maxNumberOfReplays = 100

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
    mode: number
    data: import("../../src/firebase").PlayerData
}

export const addReplayToSeed = functions.https.onRequest(async (request, response) => {
    // Ensure CORS is cool
    response
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

    const { seed, uuid, version, data, mode } = JSON.parse(request.body) as ReplayUploadRequest

    if (!uuid) {
        return response.status(400).send({ error: "Needs a uuid in request" })
    }
    if (!version) {
        return response.status(400).send({ error: "Needs a version in request" })
    }
    if (!data) {
        return response.status(400).send({ error: "Needs a data of type PlayerData in request" })
    }
    if (!mode) {
        return response.status(400).send({ error: "Needs a game mode in request" })
    }

    const db = admin.firestore()
    const recordings = db.collection("recordings")
    const dataRef = await recordings.doc(seed)
    const zippedSeedData = (await dataRef.get()).data() as SeedDataZipped

    // Mainly to provide typings to dataRef.set
    const saveToDB = (a: SeedDataZipped) => dataRef.set(a)

    if (!zippedSeedData) {
        // We need too make the data
        const document = { replaysZipped: zippedObj([data]) }
        await saveToDB(document)
    } else {
        // We need to amend the data instead
        const seedData = unzipSeedData(zippedSeedData)
        const existingCount = seedData.replays.length
        const shouldUpdateNotAdd = existingCount < maxNumberOfReplays
        const hasOverHalfData = existingCount > maxNumberOfReplays / 2

        // Do we want to keep the top of all time
        const highScoresOnly = mode === 2 
        if (highScoresOnly) {
            // Contains the single best score this user has submitted,
            // whether it's the one we're trying to submit now or a previous one
            // (although they _should_ have at most 1 previous entry in the list)
            const currentPlayersReplays = seedData.replays
                .filter(replay => replay.user === data.user)
                .concat(data)
                .sort((l, r) => l.score - r.score)
            const personalBest = currentPlayersReplays[currentPlayersReplays.length - 1]

            // Grab all replays that aren't by this user,
            // add in their best (which might or might not have been previously there),
            // sort it in descending order,
            // then truncate it to the length we want the list to be.
            const sortedReplays = seedData.replays
                .filter(replay => replay.user !== data.user)
                .concat(personalBest)
                .sort((l, r) => l.score - r.score)
                .reverse()
                .slice(0, maxNumberOfReplays)

            seedData.replays = sortedReplays
        }

        // We want to cap the number of recordings overall
        else if (hasOverHalfData && shouldUpdateNotAdd) {
            // One user can ship many replays until there is over half
            // the number of max replays
            // TODO: Add a real UUID for the user?
            const hasUserInData = seedData.replays.findIndex(d => d.user.name == uuid)
            const randomIndexToDrop = Math.floor(Math.random() * existingCount)
            const index = hasOverHalfData && hasUserInData !== -1 ? hasUserInData : randomIndexToDrop
            seedData.replays[index] = data
        } else {
            seedData.replays.push(data)
        }

        await saveToDB({ replaysZipped: zippedObj(seedData.replays) })
    }

    const responseJSON = { success: true }
    return response.status(200).send(responseJSON)
})

/**
 * Converts from the db representation where the seed data is gzipped into
 * a useable model JSON on the client
 */
export const unzipSeedData = (seed: SeedDataZipped): SeedData => {
    return {
        replays: unzip(seed.replaysZipped)
    }
}

const unzip = (bin: string) => {
    if (!bin) {
        throw new Error("No bin param passed to unzip")
    }
    let uncompressed = ""
    try {
        uncompressed = pako.inflate(bin, { to: "string" })
    } catch (error) {
        console.error("Issue unzipping")
        console.error(error)
    }
    let decoded = decodeURIComponent(escape(uncompressed))
    try {
        let obj = JSON.parse(decoded)
        return obj
    } catch (error) {
        console.error("Issue parsing JSON: ", decoded)
        console.error(error)
    }
}

const zippedObj = (obj: object) => {
    const str = JSON.stringify(obj)
    const data = unescape(encodeURIComponent(str))
    const zipped = pako.deflate(data, { to: "string" })
    return zipped
}
