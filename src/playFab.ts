import { PlayFabClient, PlayFabEvents } from "PlayFab-sdk"
import { Attire, defaultAttire } from "./attire"
import _ = require("lodash")
import { cache } from "./localCache"
import { titleId } from "../assets/config/playfabConfig"
import { GameMode } from "./battle/utils/gameMode"
import { APIVersion } from "./constants"
import { allAttireInGame } from "./attire/attireSets"
import { changeSettings, UserSettings, syncedSettingsKeys } from "./user/userManager"
import playfabPromisify from "./playfabPromisify"
import { firebaseConfig } from "../assets/config/firebaseConfig"
import { isAppleApp, isAndroidApp } from "./nativeComms/deviceDetection"
import { registerForPushNotifications } from "./registerForPushNotifications"

export let isLoggedIn: boolean = false

export let loginPromise: Promise<string | undefined>

export let playfabUserId: string | undefined

export const getPlayfabId = () => {
    return localStorage.getItem("playfabId") || undefined
}

let playfabEntityKey: PlayFabClientModels.EntityKey | undefined

PlayFabClient.settings.titleId = titleId

export const login = async (): Promise<string | undefined> => {
    // Game Center flow
    if (isAppleApp() && window.webkit.messageHandlers.gameCenterLogin) {
        // This is the path for people who have previously logged in with not-Game Center
        if (cache.hasPreviouslyLoggedInWithCustomId() && !cache.getNativeAuthID()) {
            const loginResult = await loginWithCustomID()

            const request = await gameCenterRequest()
            if (request) {
                const result = await playfabPromisify(PlayFabClient.LinkGameCenterAccount)(request).catch(async e => {
                    console.log("ERROR", e)
                    console.log("Going to naively try just logging in with game center instead")
                    const result = await playfabPromisify(PlayFabClient.LoginWithGameCenter)({
                        ...loginRequest(),
                        ...request
                    })
                    console.log(result)
                    return handleLoginResponse(result)
                })
                console.log(result)
                cache.setNativeAuthID((request as PlayFabClientModels.LinkGameCenterAccountRequest).GameCenterId)

                return loginResult
            }
        } else {
            // For anyone who HAS logged in with Game Center, just use that as login
            console.log("Just logging in with game center")
            const request = await gameCenterRequest()
            if (request) {
                const result = await playfabPromisify(PlayFabClient.LoginWithGameCenter)({
                    ...loginRequest(),
                    ...request
                })
                console.log(result)
                return handleLoginResponse(result)
            }
        }
    } else if (isAndroidApp() && window.GooglePlayGames) {
        if (cache.hasPreviouslyLoggedInWithCustomId() && !cache.getNativeAuthID()) {
            const loginResult = await loginWithCustomID()

            const request = await googlePlayGamesRequest()
            if (request) {
                const result = await playfabPromisify(PlayFabClient.LinkGoogleAccount)(request).catch(async e => {
                    console.log("ERROR", e)
                    console.log("Going to naively try just logging in with google account instead")
                    const result = await playfabPromisify(PlayFabClient.LoginWithGoogleAccount)({
                        ...loginRequest(),
                        ...request
                    })
                    console.log(result)
                    return handleLoginResponse(result)
                })
                console.log(result)

                if (request.ServerAuthCode) {
                    cache.setNativeAuthID(request.ServerAuthCode!)
                }

                return loginResult
            }
        } else {
            // For anyone who HAS logged in with Google, just use that as login
            console.log("Just logging in with google")
            const request = await googlePlayGamesRequest()
            if (request) {
                const result = await playfabPromisify(PlayFabClient.LoginWithGoogleAccount)({
                    ...loginRequest(),
                    ...request
                })
                console.log(result)
                return handleLoginResponse(result)
            }
        }
    }

    if (!cache.hasPreviouslyLoggedInWithCustomId()) {
        // This is either a new user, or someone on the legacy flow who's only ever logged in via native deviceId
        let customAuth = (window as any).playfabAuth
        if (customAuth) {
            // It's a native app!
            const deviceId = cache.getDeviceId()
            if (!deviceId) {
                // It's either a new user, or an existing user who's only used the legacy flow
                // Log in with native auth, then store device ID + link with custom ID

                if (customAuth.method === "LoginWithIOSDeviceID") {
                    await playfabPromisify(PlayFabClient.LoginWithIOSDeviceID)({
                        ...loginRequest(),
                        ...customAuth.payload
                    }).then(handleLoginResponse)

                    await playfabPromisify(PlayFabClient.LinkCustomID)({
                        CustomId: cache.getUUID(),
                        ForceLink: true
                    })

                    return getPlayfabId()
                } else if (customAuth.method === "LoginWithAndroidDeviceID") {
                    await playfabPromisify(PlayFabClient.LoginWithAndroidDeviceID)({
                        ...loginRequest(),
                        ...customAuth.payload
                    }).then(handleLoginResponse)

                    await playfabPromisify(PlayFabClient.LinkCustomID)({
                        CustomId: cache.getUUID(),
                        ForceLink: true
                    })

                    return getPlayfabId()
                }
            } else {
                // We shouldn't hit this flow — anyone with a localStorage deviceID should have also logged in with a customId
                // If that happens, I guess we'll just let it fall through to customID auth.
            }
        }

        // If there's no custom auth, it's a web user. They should always login with customID.
    }

    return await loginWithCustomID()
}

const loginWithCustomID = async () => {
    const request = { ...loginRequest(), CustomId: cache.getUUID() }
    loginPromise = playfabPromisify(PlayFabClient.LoginWithCustomID)(request).then(handleLoginResponse)
    return loginPromise
}

const handleLoginResponse = async (result: PlayFabModule.IPlayFabSuccessContainer<PlayFabClientModels.LoginResult>) => {
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

        if (payload.UserInventory) {
            settings.unlockedAttire = payload.UserInventory.map(i => i.ItemId!)
        }

        changeSettings(settings)
    }

    playfabUserId = result.data.PlayFabId
    if (playfabUserId) {
        localStorage.setItem("playfabId", playfabUserId)
    }

    console.log("Setting user id", playfabUserId)

    if (result.data.EntityToken) {
        playfabEntityKey = result.data.EntityToken.Entity
    }

    if (window.playfabAuth && !cache.getDeviceId()) {
        // Native device auth data exists, but needs to be linked
        if (window.playfabAuth.method === "LoginWithIOSDeviceID") {
            await playfabPromisify(PlayFabClient.LinkIOSDeviceID)({ ...window.playfabAuth.payload, ForceLink: true })
            cache.setDeviceId(window.playfabAuth.payload.DeviceId)
        } else if (window.playfabAuth.method === "LoginWithAndroidDeviceID") {
            await playfabPromisify(PlayFabClient.LinkAndroidDeviceID)({
                ...window.playfabAuth.payload,
                ForceLink: true
            })
            cache.setDeviceId(window.playfabAuth.payload.AndroidDeviceId)
        }
    }

    isLoggedIn = true

    registerForPushNotifications()

    return playfabUserId
}

const loginRequest = (): PlayFabClientModels.LoginWithCustomIDRequest => {
    return {
        TitleId: titleId,
        CreateAccount: true,
        InfoRequestParameters: {
            GetUserData: true,
            GetPlayerProfile: true,
            GetPlayerStatistics: true,
            GetUserInventory: true,
            ProfileConstraints: ({
                ShowAvatarUrl: true,
                ShowDisplayName: true
            } as unknown) as number,

            // These are all marked as "required" but also "false by default". The typings say we need them /shrug
            GetCharacterInventories: false,
            GetCharacterList: false,
            GetTitleData: false,
            GetUserAccountInfo: false,
            GetUserReadOnlyData: false,
            GetUserVirtualCurrency: false
        }
    }
}

export const gameCenterRequest = async (): Promise<
    PlayFabClientModels.LinkGameCenterAccountRequest | PlayFabClientModels.LoginWithGameCenterRequest | undefined
> => {
    console.log("gameCenterPromise")
    return new Promise((resolve, reject) => {
        // This iOS code will potentially wait for auth to complete or fail, then trigger the below event
        try {
            window.webkit.messageHandlers.gameCenterLogin.postMessage(true)

            window.addEventListener("gameCenterLogin", (e: any) => {
                console.log("MEssage returned", e.detail)
                if (e.detail) {
                    // TODO: This is massively insecure
                    // But PlayFab is giving us 500s when we pass them secure login details
                    resolve({
                        GameCenterId: e.detail.playerID,
                        PlayerId: e.detail.playerID
                        // PublicKeyUrl: e.detail.url,
                        // Salt: atob(e.detail.salt),
                        // Signature: atob(e.detail.signature),
                        // Timestamp: e.detail.timestamp
                    })
                } else {
                    resolve(undefined)
                }
            })
        } catch {
            console.log("Catch")
            resolve(undefined)
        }
    })
}

export const googlePlayGamesRequest = async (): Promise<
    PlayFabClientModels.LinkGoogleAccountRequest | PlayFabClientModels.LoginWithGoogleAccountRequest | undefined
> => {
    console.log("google play games promise")
    return new Promise((resolve, reject) => {
        // This iOS code will potentially wait for auth to complete or fail, then trigger the below event
        try {
            if (!window.GooglePlayGames) {
                return resolve(undefined)
            }
            window.GooglePlayGames.auth()

            window.addEventListener("googlePlayLogin", (e: any) => {
                console.log("MEssage returned", e.detail)
                if (e.detail.serverAuthCode) {
                    resolve({ ServerAuthCode: e.detail.serverAuthCode })
                } else {
                    resolve(undefined)
                }
            })
        } catch (e) {
            console.log("Catch", e)
            resolve(undefined)
        }
    })
}

export const updateName = async (
    name: string
): Promise<PlayFabModule.IPlayFabSuccessContainer<PlayFabClientModels.UpdateUserTitleDisplayNameResult>> => {
    await loginPromise
    return playfabPromisify(PlayFabClient.UpdateUserTitleDisplayName)({ DisplayName: name })
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

    const Statistics = stats
    return await playfabPromisify(PlayFabClient.UpdatePlayerStatistics)({ Statistics })
}

export const updateAttire = async (attire: Attire[], oldAttire: Attire[]) => {
    await loginPromise

    const response = await fetch(`https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/updateAttire`, {
        method: "POST",
        body: JSON.stringify({
            playfabId: playfabUserId,
            attireIds: attire.map(a => a.id)
        })
    })

    if (!response.ok) {
        console.log("Bad attire!")
        changeSettings({ aesthetics: { attire: oldAttire } })
    }
}

export const updateUserSettings = async (settings: UserSettings) => {
    await loginPromise

    let delta: any = {}
    syncedSettingsKeys.forEach(key => {
        delta[key] = (settings as any)[key]
    })

    return await playfabPromisify(PlayFabClient.UpdateUserData)({
        Data: { userSettings: JSON.stringify(delta) }
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

    return await playfabPromisify(PlayFabEvents.WriteEvents)({ Events: events })
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

    const result = await playfabPromisify(PlayFabClient.GetLeaderboard)({ ...defaultOpts, ...opts })
    if (!result.data.Leaderboard) {
        return []
    } else {
        return result.data.Leaderboard.map(convertPlayFabLeaderboardData)
    }
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

    const result = await playfabPromisify(PlayFabClient.GetLeaderboardAroundPlayer)({ ...defaultOpts, ...opts })
    if (!result.data.Leaderboard) {
        return []
    } else {
        return result.data.Leaderboard.map(convertPlayFabLeaderboardData)
    }
}

const attireMap = _.keyBy(allAttireInGame, "id")
export const avatarUrlToAttire = (url: string): Attire[] => {
    if (!url) return [defaultAttire]
    const keys = url.split(",")
    if (keys.length === 0) {
        return [defaultAttire]
    }
    return keys.map(key => attireMap[key]).filter(a => !_.isUndefined(a))
}
