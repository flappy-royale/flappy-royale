import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import * as pako from "pako"
import { File } from "@google-cloud/storage"
import _ = require("lodash")
import { PlayFabServer } from "playfab-sdk"

import { SeedsResponse, ReplayUploadRequest, ConsumeEggRequest, PlayfabUserStats } from "./api-contracts"
import { getItemFromLootBoxStartingWith } from "./getItemFromLootBox"

/// Careful with any ../ - you need to make sure they don't make contact with game-code

// This is duped in playfabConfig
export const lookupBoxesForTiers = {
    "-1": "loot-box-tier-unknown",
    0: "s-tier-lootbox",
    1: "a-tier-lootbox",
    2: "b-tier-lootbox",
    3: "c-tier-lootbox"
}

import { PlayfabUser, SeedDataZipped, SeedData, PlayerData, JsonSeedData } from "../../src/firebaseTypes"
import { attireIDToUUIDMap } from "./attireIDToUUID.derived"

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
PlayFabServer.settings.developerSecretKey = functions.config().playfab.secret
PlayFabServer.settings.titleId = functions.config().playfab.title

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

export const addReplayToSeed = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        const replay = JSON.parse(request.body) as ReplayUploadRequest
        const { seed, uuid, version, data, mode, position, opponents, playfabId, demo } = replay
        const won = position === 0 && opponents > 0

        if (!version) {
            return response.status(400).send({ error: "Needs a version in request" })
        }
        if (!data) {
            return response.status(400).send({ error: "Needs a data of type PlayerData in request" })
        }
        if (!mode) {
            return response.status(400).send({ error: "Needs a game mode in request" })
        }

        const hasFlapped = data.actions.filter(a => a.action === "flap").length > 2
        if (!hasFlapped) {
            return response.status(200).send({ status: "Did not flap, not doing anything with recording data" })
        }

        // "uuid" is currently just display name.
        // The filename has historically been seed/name-timestamp.json
        // If playfabId exists, we'll use their playfabId instead of their name/uuid.
        let userIdentifier = uuid

        let user: PlayfabUser | undefined

        if (playfabId) {
            const result = await playfabPromisify(PlayFabServer.GetPlayerProfile)({
                PlayFabId: playfabId,
                ProfileConstraints: ({
                    ShowAvatarUrl: true,
                    ShowDisplayName: true
                } as unknown) as number // This is a bug in PlayFab's typings
            })

            if (result && result.data && result.data.PlayerProfile) {
                const profile = result.data.PlayerProfile
                if (profile.DisplayName && profile.PlayerId) {
                    user = {
                        name: profile.DisplayName,
                        playfabId: profile.PlayerId,
                        avatarUrl: profile.AvatarUrl || ""
                    }
                } else {
                    console.log("Could not find display name, avatar, or profileId")
                    console.log(profile)
                }
            }

            if (user) {
                console.log("Fetched PlayFab user:", user)
                delete data.user
                data.playfabUser = user
                userIdentifier = user.playfabId
            }
        }

        const document = { replaysZipped: zippedObj([data]) }
        const json = JSON.stringify(document)

        // All replays get saved to the firehose bucket, so we can analyze later
        const firehoseBucket = admin.storage().bucket("flappy-royale-replay-firehose")
        const firehoseFile = firehoseBucket.file(`${seed}/${userIdentifier}-${new Date()}.json`)
        await firehoseFile.save(json)

        // Non-Playfab users can still get shoved in the firehose bucket, but they can't show up in others' games.
        if (data.playfabUser && playfabId) {
            // Only the first N seeds per hour get collated into real in-game ghost data
            const bucket = admin.storage().bucket("flappy-royale-replay-uploads")
            const [existingFiles] = await bucket.getFiles({ prefix: `${seed}/` })

            if (existingFiles.length < numberOfReplaysPerSeed) {
                const file = bucket.file(`${seed}/${userIdentifier}-${new Date()}.json`)
                await file.save(json)
            }

            // Upload stats
            const { stats, userData } = await replayDataToStats(replay, playfabId)
            if (stats) {
                const statsArray = []
                for (const key in stats) {
                    statsArray.push({
                        StatisticName: key,
                        Value: (stats as any)[key]
                    })
                }
                await playfabPromisify(PlayFabServer.UpdatePlayerStatistics)({
                    PlayFabId: playfabId,
                    Statistics: statsArray
                })
            }

            if (userData) {
                await playfabPromisify(PlayFabServer.UpdateUserData)({
                    PlayFabId: playfabId,
                    Data: userData
                })
            }

            return response.status(200).send()
        } else {
            const responseJSON = { success: true }
            return response.status(200).send(responseJSON)
        }
    })
})

export const replayDataToStats = async (
    replay: ReplayUploadRequest,
    playfabId: string
): Promise<{
    stats?: Partial<PlayfabUserStats>
    userData?: { scoreHistory: string; winStreak: number }
}> => {
    // Guard against old clients without valid stats data
    if (_.isUndefined(replay.opponents) || _.isUndefined(replay.time) || _.isUndefined(replay.position)) {
        console.log(
            `User '${playfabId}' did not send valid stats data, ${replay.opponents}, ${replay.time}, ${replay.position}`
        )
        return {}
    }

    const { position, data, opponents, mode, time } = replay
    const { actions, score } = data

    // Fetch and increment score history
    const historyRequest = await playfabPromisify(PlayFabServer.GetUserData)({
        PlayFabId: playfabId,
        Keys: ["scoreHistory", "winStreak"]
    })
    let scoreHistory: number[] = []
    let winStreak = 0

    if (historyRequest.data && historyRequest.data.Data) {
        if (historyRequest.data.Data.scoreHistory && historyRequest.data.Data.scoreHistory.Value) {
            scoreHistory = JSON.parse(historyRequest.data.Data.scoreHistory.Value!) || []
        }

        if (historyRequest.data.Data.scoreHistory && historyRequest.data.Data.winStreak.Value) {
            winStreak = parseInt(historyRequest.data.Data.winStreak.Value!) || 0
        }
    }

    scoreHistory.unshift(score)

    const RoyaleMode = 1
    const TrialMode = 2

    let result: Partial<PlayfabUserStats> = {
        BestPosition: position,
        BirdsPast: opponents - position,
        Crashes: position === 0 && mode === RoyaleMode ? 0 : 1,
        FirstPipeFails: score < 1 ? 1 : 0,
        Flaps: actions.filter(a => a.action === "flap").length,
        Score: score,
        TotalGamesPlayed: 1,
        TotalScore: score,
        TotalTimeInGame: time || 0
    }

    if (mode === TrialMode) {
        result["DailyTrial-1"] = data.score
    } else if (mode === RoyaleMode) {
        result.RoyaleGamesPlayed = 1
        if (position === 0 && opponents > 0) {
            winStreak += 1
            result.RoyaleGamesWon = 1
            result.RoyaleWinStreak = winStreak
            result.CurrentRoyaleStreak = winStreak
        } else {
            result.CurrentRoyaleStreak = 0
            winStreak = 0
        }
    }

    return {
        stats: result,
        userData: {
            scoreHistory: JSON.stringify(scoreHistory),
            winStreak
        }
    }
}

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

export interface AttireChangeRequest {
    playfabId: string
    attireIds: string[] // Attire IDs
}

export const updateAttire = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        const { playfabId, attireIds } = JSON.parse(request.body) as AttireChangeRequest

        const inventory = (await playfabPromisify(PlayFabServer.GetCatalogItems)({})).data.Catalog
        if (!inventory) {
            return response.status(500).send({ error: "Could not fetch inventory catalog" })
        }

        const attire: PlayFabAdminModels.CatalogItem[] = attireIds.map(id => {
            return inventory.find(i => i.ItemId === id)!
        })

        if (attire.length !== attireIds.length) {
            return response.status(500).send({ error: "Could not find at least one item" })
        }

        const data = (await playfabPromisify(PlayFabServer.GetUserData)({
            PlayFabId: playfabId
        })).data.Data

        if (!data && data!.unlockedAttire && data!.unlockedAttire.Value) {
            return response.status(500).send({ error: "Could not fetch player inventory" })
        }

        // This is a string of attireIDs as numbers (but they're strings)
        const playerInventory = data!.unlockedAttire.Value!.split(",")

        let allAttireIsValid = true

        for (const a of attire) {
            // Let's assume anything with no price set is free
            if (!a.VirtualCurrencyPrices) {
                continue
            }

            // Otherwise, something with an explicit price of 0 is free
            if (a.VirtualCurrencyPrices && a.VirtualCurrencyPrices.RM === 0) {
                continue
            }

            // If it is a loot box item, the user might own it!
            // Check for both the old school "banana" and the new-school "4"
            if (
                _.includes(playerInventory, a.ItemId) ||
                _.includes(playerInventory, String(attireIDToUUIDMap[a.ItemId]))
            ) {
                continue
            }

            allAttireIsValid = false
        }

        if (!allAttireIsValid) {
            return response.status(403).send({ error: "Player tried to wear attire they did not have access to" })
        }

        // TODO: How do we verify that the given user actually made this request themselves?
        await playfabPromisify(PlayFabServer.UpdateAvatarUrl)({
            ImageUrl: attire.map(a => a.ItemId).join(","),
            PlayFabId: playfabId
        })

        return response.status(204).send()
    })
})

export const openConsumableEgg = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        const { tier, playfabId } = JSON.parse(request.body) as ConsumeEggRequest

        ////
        ////  Step 1, grab all of the inventory - this is used in 2 ways
        ////    - Confirming you have an egg to consume
        ////    - Filtering out taken options for the lootbox
        ////

        const inventoryData = (await playfabPromisify(PlayFabServer.GetUserData)({
            PlayFabId: playfabId
        })).data.Data

        console.log("INVENTORY DATA", playfabId, inventoryData)

        let inventoryIds: string[]

        if (inventoryData && inventoryData!.unlockedAttire && inventoryData!.unlockedAttire!.Value) {
            console.log("InventoryData exists!")
            inventoryIds = inventoryData!.unlockedAttire!.Value!.split(",")
            console.log(inventoryIds)
        } else {
            // Temporary (or "temporary", lol) support for older clients that haven't backfilled user inventory in userData
            // Eventually, we won't care about supporting UserInventory items
            // and can fall straight back to 500-ing if userData lookup fails.

            const inventoryResult = await playfabPromisify(PlayFabServer.GetUserInventory)({ PlayFabId: playfabId })
            const inventory = inventoryResult.data.Inventory
            if (!inventory) {
                return response.status(400).send({ error: "Could not fetch inventory for player" })
            }

            inventoryIds = inventory.map(i => i.ItemId).filter(Boolean) as string[]
        }

        if (!inventoryIds) {
            return response.status(500).send({ error: "Could not fetch player inventory" })
        }

        ////
        ////  Step 2, grab all of the loot tables which are sets of tiered loot
        ////
        const lootTables = await playfabPromisify(PlayFabServer.GetRandomResultTables)({
            TableIDs: Object.values(lookupBoxesForTiers)
        })

        if (!lootTables.data.Tables) {
            return response.status(400).send({ error: "Could not fetch drop tables" })
        }

        ////
        ////  Step 3, roll the dice
        ////

        // "egg-3".split("egg-") > [ '', '3' ]
        const initialTier = tier
        const rewardedItem = getItemFromLootBoxStartingWith(
            initialTier,
            Object.values(lootTables.data.Tables),
            inventoryIds
        )

        if (!rewardedItem) {
            // You've unlocked them all. Congrats. You should never
            // get here because you won't get a consumable egg, but best to be prepared
            return response.status(204).send({ item: null })
        }

        ////
        ////  Step 4, Get the UUID for the item, and migrate to uuids if we need to
        ////

        // Handle case where migration went wrong:
        //
        // e.g. [object Undefined],[object Undefined],[object Undefined],[object Undefined],[object Undefined],[object Undefined],[object Undefined]
        if (inventoryIds[0] && isNaN(Number(inventoryIds[0]))) {
            inventoryIds = inventoryIds.map(id => {
                if (id === "[object Undefined]") {
                    return Math.floor(Math.random() * 200).toString()
                }
                return id
            })
        }

        if (inventoryIds[0] && isNaN(Number(inventoryIds[0]))) {
            inventoryIds = inventoryIds.map(id => attireIDToUUIDMap[id] || id).map(toString)
        }

        // Get the new UUID
        const unlockedAttireUUID = attireIDToUUIDMap[rewardedItem.ResultItem].toString()

        ////
        ////  Step 5, Grant the new item
        ////
        await playfabPromisify(PlayFabServer.UpdateUserData)({
            PlayFabId: playfabId,
            Data: { unlockedAttire: [...inventoryIds, unlockedAttireUUID].join(",") }
        }).catch(e => {
            return response.status(400).send({ error: "Could not grant item to user" })
        })

        return response.status(200).send({ item: rewardedItem.ResultItem })
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

// Copy/pasted from the file of the same name in src, don't want to deal with include logic
function playfabPromisify<T extends PlayFabModule.IPlayFabResultCommon>(
    fn: (request: any, cb: PlayFabModule.ApiCallback<T>) => void
): (request: PlayFabModule.IPlayFabRequestCommon) => Promise<PlayFabModule.IPlayFabSuccessContainer<T>> {
    return (request: PlayFabModule.IPlayFabRequestCommon) => {
        return new Promise((resolve, reject) => {
            fn(request, (error: PlayFabModule.IPlayFabError, result: PlayFabModule.IPlayFabSuccessContainer<T>) => {
                if (error) {
                    console.error("Issue with API request:")
                    console.error(error)
                    console.error(request)
                    reject(error)
                }
                resolve(result)
            })
        })
    }
}
