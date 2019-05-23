export interface SeedsResponse {
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
}
