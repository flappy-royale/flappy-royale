import * as firebase from "firebase/app"
import "firebase/firestore"

import {
    SeedsResponse,
    ReplayUploadRequest,
    ConsumeEggResponse,
    ConsumeEggRequest
} from "../functions_firebase/src/api-contracts"
import { cache } from "./localCache"
import { unzip } from "./zip"
import { firebaseConfig, replayJsonUrl } from "../assets/config/firebaseConfig"
import _ = require("lodash")
import { loginPromise, getPlayfabId } from "./playFab"
import { SeedData, JsonSeedData, SeedDataZipped } from "./firebaseTypes"
import { LootboxTier } from "../functions_firebase/src/LootboxTier"

firebase.initializeApp(firebaseConfig)

/** Returns replay data for a given seed.
 * If not-expired cached data exists, it will prioritize that.
 * Otherwise, it tries to fetch from the server and cache that data (or falls back to the cache if that fails)
 * If the recording has > 99 birds, it will randomly pick 99.
 */
export const fetchRecordingsForSeed = async (seed: string): Promise<SeedData> => {
    function truncate(data: SeedData): SeedData {
        if (data.replays.length > 99) {
            data.replays = _.sampleSize(data.replays, 99)
        }
        return data
    }

    const cached = cache.getRecordings(seed)

    // If cache data (a) has an expiry and (b) hasn't expired yet, let's use it instead!
    if (cached && cached.expiry) {
        const expiry = new Date(cached.expiry)
        const now = new Date()

        if (now >= expiry) {
            return truncate(unzipSeedData(cached))
        }
    }

    const response = await fetch(replayJsonUrl(seed))
    const json = (await response.json()) as JsonSeedData | undefined

    if (!json) {
        if (cached) {
            console.log("Could not fetch recordings over the network. Falling back on local cache")
            return truncate(unzipSeedData(cached))
        } else {
            throw `No remote data or cache data! for seed ${seed}`
        }
    }

    cache.setRecordings(seed, json)

    return truncate(unzipSeedData(json))
}

/** Returns current seed data, intelligently deciding whether to fetch from the network or just return cached data
 * @param apiVersion The current API version, changes when we manually bump it
 * @param prioritizeCache If true, will always return cache data instead of network unless there is no cache data
 */
export const getSeeds = async (
    apiVersion: string,
    prioritizeCache: boolean = false
): Promise<SeedsResponse | undefined> => {
    const cached = cache.getSeeds(apiVersion)

    if (!cached) {
        return await getSeedsFromAPI(apiVersion)
    }

    if (prioritizeCache) {
        return cached
    }

    if (cached.expiry) {
        const expiry = new Date(cached.expiry)
        const now = new Date()

        if (now >= expiry) {
            return await getSeedsFromAPI(apiVersion)
        } else {
            return cached
        }
    } else {
        return await getSeedsFromAPI(apiVersion)
    }
}

/**
 * Grabs a copy of the seeds from a google function which ensures we have consistent seeds.
 * It's expected that this would be called every time you see the main menu.
 *
 * Call it will have the side-effect of saving your seeds into local cache, so that if the
 * app opens up offline you've got something to work with.
 */
const getSeedsFromAPI = (apiVersion: string) => {
    return fetchWithRetry(`https://flappyroyale.azurewebsites.net/api/seeds?version=${apiVersion}`)
        .then(r => r.json() as Promise<SeedsResponse | undefined>)
        .then(seeds => {
            if (!seeds) {
                console.log("Could not fetch seeds (received undefined), falling back to local cache")
                return cache.getSeeds(apiVersion)
            }

            // We cycle through the list of seeds in order.
            // In practice, an individual user won't notice the list of games they're playing is in a fixed order.
            // But since we might add new seeds on the server, we want each user to havce a different seed order so that new seeds get populated more quickly
            seeds.royale = _.shuffle(seeds.royale)!

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
    return fetch(`https://flappyroyale.azurewebsites.net/api/addReplayToSeed`, {
        // return fetch(`http://localhost:5000/${firebaseConfig.projectId}/us-central1/addReplayToSeed`, {
        method: "POST",
        body: JSON.stringify(replay)
    })
}

export const consumeEgg = async (tier: LootboxTier): Promise<ConsumeEggResponse> => {
    await loginPromise
    const playfabId = getPlayfabId()
    if (!playfabId) return Promise.reject("No playfabId")

    const request: ConsumeEggRequest = { playfabId, tier }

    return fetch(`https://flappyroyale.azurewebsites.net/api//openConsumableEgg`, {
        method: "POST",
        body: JSON.stringify(request)
    }).then(r => r.json())
}

/** Used in training */
export const emptySeedData: SeedData = { replays: [] }

/**
 * Converts from the db representation where the seed data is gzipped into
 * a useable model JSON on the client
 */
export const unzipSeedData = (seed: SeedDataZipped | JsonSeedData): SeedData => {
    return {
        replays: unzip(seed.replaysZipped)
    }
}

const fetchWithRetry = async (
    url: RequestInfo,
    opts?: RequestInit & { retry?: number; retryCallback?: (times: number) => void }
    // @ts-ignore
): Promise<Response> => {
    let retry = (opts && opts.retry) || 3
    while (retry > 0) {
        try {
            return await fetch(url, opts)
        } catch (e) {
            if (opts && opts.retryCallback) {
                opts.retryCallback(retry)
            }
            retry = retry - 1
            if (retry == 0) {
                throw e
            }
        }
    }
}
