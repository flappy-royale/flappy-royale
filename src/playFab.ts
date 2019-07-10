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
import { isAppleApp } from "./nativeComms/deviceDetection"
import { PlayfabAuth } from "./nativeApp"

export let isLoggedIn: boolean = false

export let loginPromise: Promise<string | undefined>

export let playfabUserId: string | undefined
let playfabEntityKey: PlayFabClientModels.EntityKey | undefined

PlayFabClient.settings.titleId = titleId

/** 
            - To investigate: can/should we use a Game Center guest ID? (Probably not, cause if we have a custom ID then we can link)
            - Add in a manual migration path: if a UUID is set in the JS cache, we should (1) log in with it, (2) link to Game Center and (3) delete cache. Next login will be pure game center.
            - Since this event only fires once, what happens on browser reload (e.g. update)?
            */

export const login = async () => {
    let method = PlayFabClient.LoginWithCustomID
    let loginRequest: PlayFabClientModels.LoginWithCustomIDRequest = {
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

    let customAuth = (window as any).playfabAuth

    if (isAppleApp()) {
        const response = await gameCenterPromise()
        if (response) {
            if (response.method === "LoginWithGameCenter") {
                method = PlayFabClient.LoginWithGameCenter
            }
            loginRequest = { ...loginRequest, ...response.payload }
        } else if (customAuth && customAuth.method === "LoginWithIOSDeviceID") {
            method = PlayFabClient.LoginWithIOSDeviceID
            loginRequest = { ...loginRequest, ...customAuth.payload }
        }
    } else if (customAuth && customAuth.method === "LoginWithAndroidDeviceID") {
        method = PlayFabClient.LoginWithAndroidDeviceID
        loginRequest = { ...loginRequest, ...customAuth.payload }
    }

    if (method === PlayFabClient.LoginWithCustomID) {
        loginRequest.CustomId = cache.getUUID(titleId)
    }

    loginPromise = playfabPromisify(method)(loginRequest).then(
        (result: PlayFabModule.IPlayFabSuccessContainer<PlayFabClientModels.LoginResult>) => {
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

            if (result.data.EntityToken) {
                playfabEntityKey = result.data.EntityToken.Entity
            }

            isLoggedIn = true

            return playfabUserId
        }
    )
}

const gameCenterPromise = async (): Promise<PlayfabAuth | undefined> => {
    console.log("gameCenterPrmise")
    return new Promise((resolve, reject) => {
        console.log("In promise")
        // This iOS code will potentially wait for auth to complete or fail, then trigger the below event
        try {
            console.log("Trying")
            window.webkit.messageHandlers.gameCenterLogin.postMessage(true)

            window.addEventListener("gameCenterLogin", (e: any) => {
                console.log("MEssage returned", e.detail)
                if (e.detail) {
                    resolve({
                        method: "LoginWithGameCenter",
                        payload: {
                            PlayerId: e.detail.playerID,
                            PublicKeyUrl: e.detail.url,
                            Salt: atob(e.detail.salt),
                            Signature: atob(e.detail.signature),
                            Timestamp: e.detail.timestamp
                        }
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
