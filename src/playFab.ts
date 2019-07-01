import { PlayFabClient } from "PlayFab-sdk"
import { allAttire, Attire } from "./attire"
import _ = require("lodash")
import { cache } from "./localCache"
import { titleId } from "../assets/config/playfabConfig"
import { getUserSettings } from "./user/userManager"
import { GameMode } from "./battle/utils/gameMode"

export let isLoggedIn: boolean = false

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

    method(
        loginRequest,
        (error: any, result: PlayFabModule.IPlayFabSuccessContainer<PlayFabClientModels.LoginResult>) => {
            if (error) {
                console.log("Login error:", error)
                return
            }

            isLoggedIn = true
            if (result.data.NewlyCreated) {
                const settings = getUserSettings()
                updateName(settings.name)
                updateAttire(settings.aesthetics.attire)
            }
        }
    )
}

export const updateName = (name: string) => {
    PlayFabClient.UpdateUserTitleDisplayName({ DisplayName: name }, (error: any, result) => {
        if (!error) {
            isLoggedIn = true
        }
        console.log(error, result)
    })
}

export const playedGame = (data: {
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

    PlayFabClient.UpdatePlayerStatistics(
        {
            Statistics: stats
        },
        () => {}
    )
}

export const updateAttire = (attire: Attire[]) => {
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

export const event = (name: string, params: any) => {
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

export const getLeaderboard = async (): Promise<LeaderboardResult[]> => {
    // PlayFab's function signatures are juuust odd enough that we can't use an es6 promisify polyfill :/
    const getLeaderboard = async (opts: PlayFabClientModels.GetLeaderboardRequest) => {
        return new Promise((resolve, reject) => {
            PlayFabClient.GetLeaderboard(opts, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result.data.Leaderboard)
                }
            })
        })
    }

    const getLeaderboardAroundPlayer = async (opts: PlayFabClientModels.GetLeaderboardAroundPlayerRequest) => {
        return new Promise((resolve, reject) => {
            PlayFabClient.GetLeaderboardAroundPlayer(opts, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result.data.Leaderboard)
                }
            })
        })
    }

    const results = await Promise.all([
        getLeaderboard({
            StatisticName: "DailyTrial",
            StartPosition: 0,
            MaxResultsCount: 3,
            ProfileConstraints: ({
                ShowAvatarUrl: true,
                ShowDisplayName: true
            } as unknown) as number // sigh, the PlayFab TS typings are wrong
        }),

        getLeaderboardAroundPlayer({
            StatisticName: "DailyTrial",
            MaxResultsCount: 3,
            ProfileConstraints: ({
                ShowAvatarUrl: true,
                ShowDisplayName: true
            } as unknown) as number
        })
    ])
    console.log("RESULTS", results)
    return (_(results)
        .flatten()
        .map(convertPlayFabLeaderboardData)
        .uniqBy("position") // In case the user is in the top 3! this is rare enough we can spare the extra network call
        .value() as unknown) as LeaderboardResult[]
}

interface LeaderboardResult {
    name: string
    attire: Attire[]
    position: number
    score: number
}

const convertPlayFabLeaderboardData = (
    entry: PlayFabClientModels.PlayerLeaderboardEntry
): LeaderboardResult | undefined => {
    return {
        name: entry.Profile!.DisplayName!,
        attire: avatarUrlToAttire(entry.Profile!.AvatarUrl!),
        position: entry.Position,
        score: entry.StatValue
    }
}

const attireMap = _.keyBy(allAttire, "id")
const avatarUrlToAttire = (url: string): Attire[] => {
    return url.split(",").map(key => attireMap[key])
}
