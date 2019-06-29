import { PlayFabClient } from "PlayFab-sdk"
import { allAttire, Attire } from "./attire"
import _ = require("lodash")
import { promisify } from "util"
import { Display } from "phaser"

export let isLoggedIn: boolean = false

export const login = () => {
    PlayFabClient.settings.titleId = "BBB0C"
    const loginRequest = {
        // Currently, you need to look up the correct format for this object in the API-docs:
        // https://api.playfab.com/documentation/Client/method/LoginWithCustomID
        TitleId: PlayFabClient.settings.titleId,
        CustomId: "1234",
        CreateAccount: true
    }

    PlayFabClient.LoginWithCustomID(loginRequest, (result, error) => {
        if (!error) {
            this.isLoggedIn = true
        }
    })
}

export const updateName = (name: string) => {
    PlayFabClient.UpdateUserTitleDisplayName({ DisplayName: name }, (error: any, result) => {
        if (!error) {
            this.isLoggedIn = true
        }
        console.log(error, result)
    })
}

export const sendTrialScore = (score: number) => {
    PlayFabClient.UpdatePlayerStatistics(
        {
            Statistics: [
                {
                    StatisticName: "DailyTrial",
                    Value: score
                }
            ]
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
    return _(results)
        .flatten()
        .map(convertPlayFabLeaderboardData)
        .uniqBy("position") // In case the user is in the top 3! this is rare enough we can spare the extra network call
        .value()
}

interface LeaderboardResult {
    name: string
    attire: Attire[]
    position: number
    score: number
}

const convertPlayFabLeaderboardData = (entry: PlayFabClientModels.PlayerLeaderboardEntry): LeaderboardResult => {
    return {
        name: entry.Profile.DisplayName,
        attire: avatarUrlToAttire(entry.Profile.AvatarUrl),
        position: entry.Position,
        score: entry.StatValue
    }
}

const attireMap = _.keyBy(allAttire, "id")
const avatarUrlToAttire = (url: string): Attire[] => {
    return url.split(",").map(key => attireMap[key])
}
