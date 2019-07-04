import { PlayFabClient } from "PlayFab-sdk"
import { allAttire, Attire } from "./attire"
import _ = require("lodash")
import { cache } from "./localCache"
import { titleId } from "../assets/config/playfabConfig"
import { getUserSettings } from "./user/userManager"
import { GameMode } from "./battle/utils/gameMode"
import { APIVersion } from "./constants"

export let isLoggedIn: boolean = false

let loginPromise: Promise<string>

let playerId: string | undefined

PlayFabClient.settings.titleId = titleId

export const login = () => {
    let method = PlayFabClient.LoginWithCustomID
    let loginRequest: PlayFabClientModels.LoginWithCustomIDRequest = {
        TitleId: titleId,
        CreateAccount: true
    }

    const customAuth = (window as any).playfabAuth // We have nativeApp.d.ts to deal with this casting, but the Firebase Fn compiler doesn't know about that
    if (customAuth && customAuth.method === "LoginWithIOSDeviceID") {
        method = PlayFabClient.LoginWithIOSDeviceID
        loginRequest = { ...loginRequest, ...customAuth.payload }
    } else if (customAuth && customAuth.method === "LoginWithAndroidDeviceID") {
        method = PlayFabClient.LoginWithAndroidDeviceID
        loginRequest = { ...loginRequest, ...customAuth.payload }
    }

    if (method === PlayFabClient.LoginWithCustomID) {
        loginRequest.CustomId = cache.getUUID(titleId)
    }

    loginPromise = new Promise((resolve, reject) => {
        method(
            loginRequest,
            (error: any, result: PlayFabModule.IPlayFabSuccessContainer<PlayFabClientModels.LoginResult>) => {
                if (error) {
                    console.log("Login error:", error)
                    reject(error)
                    return
                }

                playerId = result.data.PlayFabId

                isLoggedIn = true

                if (result.data.NewlyCreated) {
                    const settings = getUserSettings()
                    updateName(settings.name)
                    updateAttire(settings.aesthetics.attire)
                }

                resolve(playerId)
            }
        )
    })
}

export const updateName = async (
    name: string
): Promise<PlayFabModule.IPlayFabSuccessContainer<PlayFabClientModels.UpdateUserTitleDisplayNameResult>> => {
    await loginPromise
    return new Promise((resolve, reject) => {
        PlayFabClient.UpdateUserTitleDisplayName({ DisplayName: name }, (error: any, result) => {
            if (error) {
                reject(error)
            }
            resolve(result)
        })
    })
}

export const playedGame = async (data: {
    mode: GameMode
    score: number
    flaps: number
    won: boolean
    winStreak?: number
    birdsPast?: number
}) => {
    let stats = [
        {
            StatisticName: "TotalGamesPlayed",
            Value: 1
        },
        {
            StatisticName: "Score",
            Value: data.score
        },
        {
            StatisticName: "Flaps",
            Value: data.flaps
        }
    ]

    if (data.score === 0) {
        stats.push({
            StatisticName: "FirstPipeFails",
            Value: 1
        })
    }

    if (data.won) {
        stats.push({
            StatisticName: "RoyaleGamesWon",
            Value: 1
        })

        if (data.winStreak) {
            stats.push({
                StatisticName: "RoyaleWinStreak",
                Value: data.winStreak!
            })
        }
    }

    if (data.mode === GameMode.Trial) {
        stats.push({
            StatisticName: "DailyTrial",
            Value: data.score
        })
        stats.push({
            StatisticName: `DailyTrial-${APIVersion}`,
            Value: data.score
        })
    } else if (data.mode === GameMode.Royale) {
        stats.push({
            StatisticName: "RoyaleGamesPlayed",
            Value: 1
        })
    }

    if (data.birdsPast) {
        stats.push({
            StatisticName: "BirdsPast",
            Value: data.birdsPast
        })
    }

    return new Promise((resolve, reject) => {
        PlayFabClient.UpdatePlayerStatistics(
            {
                Statistics: stats
            },
            (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            }
        )
    })
}

export const updateAttire = async (attire: Attire[]) => {
    await loginPromise
    /* We want attire information to be attached to each player in a way that a GetLeaderboard() call returns attire data for all users
     * (so we're not making a million discrete network requests).
     * PlayFab offers Statistics, which are an int32, but I'm too lazy to set up a bitmask.
     * They also offer Tags, which are strings, but aren't editable by clients, only admins/servers.
     * But, uh, the AvatarUrl field doesn't validate URL correctness, so 🎉
     * (the URL is a comma-separated list of IDs, which we'll look up later) */
    PlayFabClient.UpdateAvatarUrl(
        {
            ImageUrl: attire.map(a => a.id).join(",")
        },
        () => {}
    )
}

export const event = async (name: string, params: any) => {
    await loginPromise

    PlayFabClient.WritePlayerEvent(
        {
            EventName: name,
            Body: params
        },
        (err, result) => {
            if (err) {
                console.log("Error writing analytics", err)
            }
        }
    )
}

// LEADERBOARDS

export const getTrialLobbyLeaderboard = async (): Promise<Leaderboard> => {
    await loginPromise

    const results = await asyncGetLeaderboard({
        StatisticName: `DailyTrial-${APIVersion}`,
        StartPosition: 0,
        MaxResultsCount: 100
    })
    console.log(results)

    const player = results.find(l => l.userId === playerId)

    return { results, player }
}

export const getTrialDeathLeaderboard = async (): Promise<Leaderboard> => {
    await loginPromise

    let twoResults = await Promise.all([
        asyncGetLeaderboard({
            StatisticName: `DailyTrial-${APIVersion}`,
            StartPosition: 0,
            MaxResultsCount: 3
        }),

        asyncGetLeaderboardAroundPlayer({
            StatisticName: `DailyTrial-${APIVersion}`,
            MaxResultsCount: 3
        })
    ])

    const flattened = _.flatten(twoResults)
    const deduped = _.uniqBy(flattened, "position") // In case the user is in the top 3! this is rare enough we can spare the extra network call

    const player = deduped.find(l => l.userId === playerId)

    return { results: deduped, player }
}

export interface Leaderboard {
    results: LeaderboardResult[]
    player?: LeaderboardResult
}

export interface LeaderboardResult {
    name: string
    attire: Attire[]
    position: number
    score: number
    userId: string
}

const convertPlayFabLeaderboardData = (entry: PlayFabClientModels.PlayerLeaderboardEntry): LeaderboardResult => {
    return {
        name: entry.Profile!.DisplayName!,
        attire: avatarUrlToAttire(entry.Profile!.AvatarUrl!),
        position: entry.Position,
        score: entry.StatValue,
        userId: entry.PlayFabId!
    }
}

const asyncGetLeaderboard = async (opts: PlayFabClientModels.GetLeaderboardRequest): Promise<LeaderboardResult[]> => {
    const defaultOpts = {
        ProfileConstraints: ({
            ShowAvatarUrl: true,
            ShowDisplayName: true
        } as unknown) as number // sigh, the PlayFab TS typings are wrong
    }

    return new Promise((resolve, reject) => {
        PlayFabClient.GetLeaderboard({ ...defaultOpts, ...opts }, (err, result) => {
            if (err) {
                reject(err)
            } else if (!result.data.Leaderboard) {
                reject("No leaderboard returned")
            } else {
                resolve(result.data.Leaderboard.map(convertPlayFabLeaderboardData))
            }
        })
    })
}

const asyncGetLeaderboardAroundPlayer = async (
    opts: PlayFabClientModels.GetLeaderboardAroundPlayerRequest
): Promise<LeaderboardResult[]> => {
    const defaultOpts = {
        ProfileConstraints: ({
            ShowAvatarUrl: true,
            ShowDisplayName: true
        } as unknown) as number // sigh, the PlayFab TS typings are wrong
    }

    return new Promise((resolve, reject) => {
        PlayFabClient.GetLeaderboardAroundPlayer({ ...defaultOpts, ...opts }, (err, result) => {
            if (err) {
                reject(err)
            } else if (!result.data.Leaderboard) {
                reject("No leaderboard returned")
            } else {
                resolve(result.data.Leaderboard.map(convertPlayFabLeaderboardData))
            }
        })
    })
}

const attireMap = _.keyBy(allAttire, "id")
const avatarUrlToAttire = (url: string): Attire[] => {
    return url.split(",").map(key => attireMap[key])
}
