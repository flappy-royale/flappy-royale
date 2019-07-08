import { PlayFabClient, PlayFabEvents, PlayFab } from "PlayFab-sdk"
import { Attire, defaultAttire } from "./attire"
import _ = require("lodash")
import { cache } from "./localCache"
import { titleId } from "../assets/config/playfabConfig"
import { GameMode } from "./battle/utils/gameMode"
import { APIVersion } from "./constants"
import { allAttireInGame } from "./attire/attireSets"
import { changeSettings, UserSettings, syncedSettingsKeys } from "./user/userManager"

export let isLoggedIn: boolean = false

export let loginPromise: Promise<string>

export let playfabUserId: string | undefined
let playfabEntityKey: PlayFabClientModels.EntityKey | undefined

PlayFabClient.settings.titleId = titleId

window.addEventListener("gameCenterLogin", (e: any) => {
    /** 
    - In the JS side, we don't loginWithCustomID, just game center login.
    - If game center ID != previous one, that's fine. Eventually probably want to warn the user.
    - If game center fails, use old auth flow (customID / UUID). To investigate: can/should we use a Game Center guest ID? (Probably not, cause if we have a custom ID then we can link)
    - Add in a manual migration path: if a UUID is set in the JS cache, we should (1) log in with it, (2) link to Game Center and (3) delete cache. Next login will be pure game center.
    */
    setTimeout(() => {
        console.log("About to try logging in")
        console.log(e.detail)
        PlayFabClient.LoginWithGameCenter(
            {
                CreateAccount: true,
                TitleId: titleId,
                PlayerId: e.detail.playerId,
                PublicKeyUrl: e.detail.url,
                Salt: e.detail.salt,
                Signature: e.detail.signature,
                Timestamp: e.detail.timestamp
            },
            (err: any, response: any) => {
                console.log(response)
            }
        )
    }, 10000)
})

export const login = () => {
    let method = PlayFabClient.LoginWithCustomID
    let loginRequest: PlayFabClientModels.LoginWithCustomIDRequest = {
        TitleId: titleId,
        CreateAccount: true,
        InfoRequestParameters: {
            GetUserData: true,
            GetPlayerProfile: true,
            GetPlayerStatistics: true,
            ProfileConstraints: ({
                ShowAvatarUrl: true,
                ShowDisplayName: true
            } as unknown) as number,

            // These are all marked as "required" but also "false by default". The typings say we need them /shrug
            GetCharacterInventories: false,
            GetCharacterList: false,
            GetTitleData: false,
            GetUserAccountInfo: false,
            GetUserInventory: false,
            GetUserReadOnlyData: false,
            GetUserVirtualCurrency: false
        }
    }

    let customAuth = (window as any).playfabAuth

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

                console.log(result)

                // Grab the data from the server and shove it in the user object
                // TODO: We should eventually merge this more intelligently, in case the user edited their attire while offline
                const payload = result.data.InfoResultPayload
                if (payload) {
                    let settings: Partial<UserSettings> = {}
                    if (payload.PlayerProfile) {
                        settings.name = payload.PlayerProfile.DisplayName
                        settings.aesthetics = { attire: avatarUrlToAttire(payload.PlayerProfile.AvatarUrl!) }
                    }

                    if (payload.UserData && payload.UserData.userSettings && payload.UserData.userSettings.Value) {
                        const storedSettings = JSON.parse(payload.UserData.userSettings.Value)
                        syncedSettingsKeys.forEach(key => {
                            if (!_.isUndefined(storedSettings[key])) {
                                ;(settings as any)[key] = storedSettings[key]
                            }
                        })
                    }
                    changeSettings(settings)
                }

                playfabUserId = result.data.PlayFabId

                if (result.data.EntityToken) {
                    playfabEntityKey = result.data.EntityToken.Entity
                }

                isLoggedIn = true

                resolve(playfabUserId)
            }
        )
    })
}

export const updateName = async (
    name: string
): Promise<PlayFabModule.IPlayFabSuccessContainer<PlayFabClientModels.UpdateUserTitleDisplayNameResult>> => {
    await loginPromise
    return new Promise((resolve, reject) => {
        PlayFabClient.UpdateUserTitleDisplayName(
            { DisplayName: name },
            (
                error: any,
                result: PlayFabModule.IPlayFabSuccessContainer<PlayFabClientModels.UpdateUserTitleDisplayNameResult>
            ) => {
                if (error) {
                    reject(error)
                }
                resolve(result)
            }
        )
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
            (err: any, result: any) => {
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
    return new Promise((resolve, reject) => {
        PlayFabClient.UpdateAvatarUrl(
            {
                ImageUrl: attire.map(a => a.id).join(",")
            },
            (err: any, result: any) => {
                if (err) reject(err)
                resolve(result)
            }
        )
    })
}

export const updateUserSettings = async (settings: UserSettings) => {
    await loginPromise

    let delta: any = {}
    syncedSettingsKeys.forEach(key => {
        delta[key] = (settings as any)[key]
    })

    return new Promise((resolve, reject) => {
        PlayFabClient.UpdateUserData(
            {
                Data: { userSettings: JSON.stringify(delta) }
            },
            (err: any, result: any) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            }
        )
    })
}

export const event = async (name: string, params: any) => {
    await loginPromise

    PlayFabClient.WritePlayerEvent(
        {
            EventName: name,
            Body: params
        },
        (err: any, _: any) => {
            if (err) {
                console.log("Error writing analytics", err)
            }
        }
    )
}

export const writeScreenTrackingEvents = async (events: PlayFabEventsModels.EventContents[]) => {
    await loginPromise
    events.forEach(e => {
        if (!e.Entity && playfabEntityKey) {
            e.Entity = playfabEntityKey
        }

        if (!e.Payload.UserID) {
            e.Payload.UserID = playfabUserId
        }
    })

    PlayFabEvents.WriteEvents(
        {
            Events: events
        },
        (err: any, _: any) => {
            if (err) {
                console.log("Error writing screen tracking events", err)
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

    const player = results.find(l => l.userId === playfabUserId)

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

    const player = deduped.find(l => l.userId === playfabUserId)

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
        PlayFabClient.GetLeaderboard({ ...defaultOpts, ...opts }, (err: any, result: any) => {
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
        PlayFabClient.GetLeaderboardAroundPlayer({ ...defaultOpts, ...opts }, (err: any, result: any) => {
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

const attireMap = _.keyBy(allAttireInGame, "id")
export const avatarUrlToAttire = (url: string): Attire[] => {
    return (url && url.split(",").map(key => attireMap[key])) || [defaultAttire]
}
