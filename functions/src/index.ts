import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { SeedsResponse } from "./api-contracts"
import * as pako from "pako"
import { SeedDataZipped, SeedData, JsonSeedData, PlayerData, PlayfabUser } from "../../src/firebase"
import { File } from "@google-cloud/storage"
import _ = require("lodash")
import { PlayFabServer } from "playfab-sdk"

const cors = require("cors")({
    origin: true
})

// IF YOU BUMP THIS:
// Even after 100 people play a new seed, that won't update for everyone until the migration task runs.
// After deploying, wait a few minutes and do this manually
// (click the "..." icon next to Firebase -> Functions -> migrateReplaysFromDbToJson, then "Open in Cloud Scheduler". Click "Run now")
const numberOfRoyaleSeeds = 50

const numberOfReplaysPerSeed = 200

// PlayFab API secret key for the production app intended to be used with our Firebase cloud fns
// Stored in firebase:functions:config
const playfabFirebaseProdSecretKey = functions.config().playfab.secret
const playfabTitle = functions.config().playfab.title

// TODO: Right now, if we bump this in the app, we need to bump this here
// and we'll probably forget to do that!!
const APIVersion = "1"

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

/** We currently change seeds every hour on the hour.
 * So the next time the client needs to re-fetch seeds is on the next hour boundary
 */
const currentSeedExpiry = (): Date => {
    const expiry = new Date()
    expiry.setMilliseconds(0)
    expiry.setSeconds(0)
    expiry.setMinutes(0)
    expiry.setHours(expiry.getHours() + 1)

    return expiry
}

export const seeds = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        const version = request.query.version || request.params.version
        const responseJSON = getSeeds(version)
        response.status(200).send(responseJSON)
    })
})

export interface ReplayUploadRequest {
    uuid?: string
    playfabId?: string
    version: string
    seed: string
    mode: number
    data: import("../../src/firebase").PlayerData
}

export const addReplayToSeed = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        const { seed, uuid, version, data, mode, playfabId } = JSON.parse(request.body) as ReplayUploadRequest

        if (!version) {
            return response.status(400).send({ error: "Needs a version in request" })
        }
        if (!data) {
            return response.status(400).send({ error: "Needs a data of type PlayerData in request" })
        }
        if (!mode) {
            return response.status(400).send({ error: "Needs a game mode in request" })
        }

        // "uuid" is currently just display name.
        // The filename has historically been seed/name-timestamp.json
        // If playfabId exists, we'll use their playfabId instead of their name/uuid.
        let userIdentifier = uuid

        if (playfabId) {
            const user: PlayfabUser = await new Promise((resolve, reject) => {
                PlayFabServer.settings.developerSecretKey = playfabFirebaseProdSecretKey
                PlayFabServer.settings.titleId = playfabTitle
                PlayFabServer.GetPlayerProfile(
                    {
                        PlayFabId: playfabId,
                        ProfileConstraints: ({
                            ShowAvatarUrl: true,
                            ShowDisplayName: true
                        } as unknown) as number // This is a bug in PlayFab's typings
                    },
                    (error: any, result: any) => {
                        if (error) {
                            reject(error)
                        }
                        const profile = result.data.PlayerProfile
                        if (!profile) {
                            reject("No profile found")
                        } else {
                            if (profile.DisplayName && profile.AvatarUrl && profile.PlayerId) {
                                resolve({
                                    name: profile.DisplayName,
                                    playfabId: profile.PlayerId,
                                    avatarUrl: profile.AvatarUrl
                                })
                            } else {
                                console.log("Could not find display name, avatar, or profileId")
                                console.log(profile)
                                reject("No profile found")
                            }
                        }
                    }
                )
            })
            console.log("Fetched PlayFab user:", user)
            data.playfabUser = user
            userIdentifier = user.playfabId
        }

        const document = { replaysZipped: zippedObj([data]) }
        const json = JSON.stringify(document)

        // All replays get saved to the firehose bucket, so we can analyze later
        const firehoseBucket = admin.storage().bucket("flappy-royale-replay-firehose")
        const firehoseFile = firehoseBucket.file(`${seed}/${userIdentifier}-${new Date()}.json`)
        await firehoseFile.save(json)

        // Non-Playfab users can still get shoved in the firehose bucket, but they can't show up in others' games.
        if (data.playfabUser) {
            // Only the first N seeds per hour get collated into real in-game ghost data
            const bucket = admin.storage().bucket("flappy-royale-replay-uploads")
            const [existingFiles] = await bucket.getFiles({ prefix: `${seed}/` })

            if (existingFiles.length < numberOfReplaysPerSeed) {
                const file = bucket.file(`${seed}/${userIdentifier}-${new Date()}.json`)
                await file.save(json)
            }
        }

        const responseJSON = { success: true }
        return response.status(200).send(responseJSON)
    })
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

const migrationTask = async () => {
    const seeds = getSeeds(APIVersion)
    const allSeeds = [...seeds.royale, seeds.daily.dev, seeds.daily.production, seeds.daily.staging]

    const getReplayJsonFromFile = async (file: File): Promise<PlayerData[]> => {
        try {
            const buffer = await file.download()
            const json = JSON.parse(buffer.toString())
            return unzipSeedData(json).replays
        } catch (error) {
            return []
        }
    }

    const expiry = new Date()
    expiry.setHours(expiry.getHours() + 1)
    expiry.setMinutes(expiry.getMinutes() + 1) // Might as well give ourselves some slack

    const bucket = admin.storage().bucket("flappy-royale-replays")
    const rawBucket = admin.storage().bucket("flappy-royale-replay-uploads")

    for (const seed of allSeeds) {
        const replayFile = bucket.file(`${seed}.json`)
        let replays: PlayerData[] = await getReplayJsonFromFile(replayFile)

        const [files] = await rawBucket.getFiles({ prefix: `${seed}/` })

        // This will take each file, download it, and unzip its replays
        // giving us an array of arrays each with a single replay
        const rawReplays = await Promise.all(files.map(getReplayJsonFromFile))
        const newReplays = _.flatten(rawReplays)

        // We want to limit the number of replays, but also prioritize new replays
        replays = [...newReplays, ...replays]
        replays = replays.slice(0, numberOfReplaysPerSeed)

        const newData: JsonSeedData = { replaysZipped: zippedObj(replays), expiry: expiry.toJSON() }
        await replayFile.save(JSON.stringify(newData))

        await rawBucket.deleteFiles({ prefix: `${seed}/` })
    }
}

// TODO: Each JSON file should support an `expiry` for client downloaders
export const migrateReplaysFromDbToJson = functions
    .runWith({ timeoutSeconds: 540, memory: "1GB" })
    .pubsub.schedule("every 1 hours")
    .onRun(async () => await migrationTask())

export const manualMigration = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        await migrationTask()

        return response.status(200).send({ success: true })
    })
})

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

const getSeeds = (version: string): SeedsResponse => {
    return {
        royale: [...Array(numberOfRoyaleSeeds).keys()].map(i => `${version}-royale-${i}`),
        daily: {
            dev: dailySeed(version, 2),
            staging: dailySeed(version, 1),
            production: dailySeed(version, 0)
        },
        hourly: {
            dev: hourlySeed(version, 2),
            staging: hourlySeed(version, 1),
            production: hourlySeed(version, 0)
        },
        expiry: currentSeedExpiry().toJSON()
    }
}
