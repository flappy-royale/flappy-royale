// Careful with imports - this gets included in functions, and importing game code into here
// will make it complex to build the game

import { LootboxTier } from "./LootboxTier"
import { PlayerData } from "firebaseTypes"

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

export type ConsumeEggRequest = { tier: LootboxTier; playfabId: string }

export type ConsumeEggResponse =
    | { error: string } // uh oh
    | { item: string | null } // the id you can use to look up the egg\

export interface ReplayUploadRequest {
    uuid?: string
    playfabId?: string
    version: string
    demo: boolean
    seed: string
    mode: number
    position: number
    opponents: number
    data: PlayerData
    time: number // Delta in ms
}

export interface PlayfabUserStats {
    BestPosition: number
    BirdsPast: number
    Crashes: number
    CurrentRoyaleStreak: number
    "DailyTrial-1": number // TODO: Bump this when you bump APIVersion
    FirstPipeFails: number
    Flaps: number
    RoyaleGamesPlayed: number
    RoyaleGamesWon: number
    RoyaleWinStreak: number
    Score: number // Highest score
    TotalGamesPlayed: number
    TotalScore: number
    TotalTimeInGame: number // In ms
}

/** Potential responses from the addReplayToSeed */
export type ReplayUploadResponse =
    | { success: true } // congrats, but no egg
    | { error: string } // uh oh
    | { egg: undefined | LootboxTier; itemInstanceId?: string } // could have an egg
