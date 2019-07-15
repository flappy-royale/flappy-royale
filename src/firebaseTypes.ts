// Moved here to avoid diamond-ish dependencies

import { UserSettings } from "./user/UserSettingsTypes"

/** How it's stored in the DB to save on fs space */
export interface SeedDataZipped {
    replaysZipped: string
}

export interface JsonSeedData {
    replaysZipped: string
    expiry: string
}

/** How it's unzipped in the client */
export interface SeedData {
    replays: PlayerData[]
}

export interface PlayfabUser {
    name: string
    playfabId: string
    avatarUrl: string
}

export interface PlayerData {
    user: UserSettings
    playfabUser?: PlayfabUser

    /** User input actions */
    actions: PlayerEvent[]
    timestamp: number
    score: number
}

export interface PlayerEvent {
    timestamp: number
    action: "flap" | "sync" | "died"
    value?: number
}
