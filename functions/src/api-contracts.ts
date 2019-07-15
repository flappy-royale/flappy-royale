// Careful with imports - this gets included in functions, and importing game code into here
// will make it complex to build the game

import { LootboxTier } from "../../src/attire"
import { PlayerData } from "../../src/firebaseTypes"

export interface SeedsResponse {
    royale: string[]
    daily: {
        production: string
        staging: string
        dev: string
    }
    hourly: {
        production: string
        staging: string
        dev: string
    }

    /** ISO 8601 string for when the client should next fetch seeds */
    expiry: string
}

export interface LootBoxRequest {
    dropTableName: string
    playfabId: string
}

export type ConsumeEggRequest = { itemInstanceId: string; playfabId: string }

export type ConsumeEggResponse =
    | { error: string } // uh oh
    | { item: string | null } // the id you can use to look up the egg\

export interface ReplayUploadRequest {
    uuid?: string
    playfabId?: string
    version: string
    seed: string
    mode: number
    won: boolean
    data: PlayerData
}

/** Potential responses from the addReplayToSeed */
export type ReplayUploadResponse =
    | { success: true } // congrats, but no egg
    | { error: string } // uh oh
    | { egg: undefined | LootboxTier; itemInstanceId?: string } // could have an egg
