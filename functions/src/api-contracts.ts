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
