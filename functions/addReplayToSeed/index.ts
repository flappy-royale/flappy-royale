import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { PlayFabServer } from "playfab-sdk"
import _ = require("lodash")
import { ContainerClient, StorageSharedKeyCredential, BlobServiceClient } from "@azure/storage-blob"

import { ReplayUploadRequest, PlayfabUserStats } from "../src/api-contracts"
import { PlayfabUser } from "../../src/serverTypes"
import { numberOfReplaysPerSeed, FirehoseRecordingContainerName, RecordingContainerName } from "../src/constants"
import playfabPromisify from "../src/playfabPromisify"
import { zippedObj } from "../src/compression"
import setUpPlayfab from "../src/setUpPlayfab"

const uploadText = async (content: string, filename: string, containerClient: ContainerClient) => {
    const blobClient = containerClient.getBlockBlobClient(filename)
    const uploadBlobResponse = await blobClient.upload(content, content.length)
    console.log(uploadBlobResponse)
}

const httpTrigger: AzureFunction = async function(context: Context, req: HttpRequest): Promise<void> {
    const { seed, uuid, version, data, mode, playfabId } = context.req.body

    if (!version) {
        context.res = {
            status: 400,
            body: "Needs a version in request"
        }
        return
    }
    if (!data) {
        context.res = {
            status: 400,
            body: "Needs a data of type PlayerData in request"
        }
        return
    }
    if (!mode) {
        context.res = {
            status: 400,
            body: "Needs a game mode in request"
        }
        return
    }

    const hasFlapped = data.actions.filter(a => a.action === "flap").length > 2
    if (!hasFlapped) {
        context.res = {
            status: 200,
            body: "Did not flap, not doing anything with recording data"
        }
        return
    }

    // "uuid" is currently just display name.
    // The filename has historically been seed/name-timestamp.json
    // If playfabId exists, we'll use their playfabId instead of their name/uuid.
    let userIdentifier = uuid

    let user: PlayfabUser | undefined

    if (playfabId) {
        setUpPlayfab()
        const result = await playfabPromisify(PlayFabServer.GetPlayerProfile)({
            PlayFabId: playfabId,
            ProfileConstraints: ({
                ShowAvatarUrl: true,
                ShowDisplayName: true
            } as unknown) as number // This is a bug in PlayFab's typings
        })

        if (result && result.data && result.data.PlayerProfile) {
            const profile = result.data.PlayerProfile
            if (profile.DisplayName && profile.PlayerId) {
                user = {
                    name: profile.DisplayName,
                    playfabId: profile.PlayerId,
                    avatarUrl: profile.AvatarUrl || ""
                }
            } else {
                console.log("Could not find display name, avatar, or profileId")
                console.log(profile)
            }
        }

        if (user) {
            console.log("Fetched PlayFab user:", user)
            delete data.user
            data.playfabUser = user
            userIdentifier = user.playfabId
        }
    }

    const document = { replaysZipped: zippedObj([data]) }
    const json = JSON.stringify(document)

    // All replays get saved to the firehose bucket, so we can analyze later

    const sharedKeyCredential = new StorageSharedKeyCredential(
        process.env.STORAGE_ACCOUNT,
        process.env.STORAGE_ACCOUNT_KEY
    )
    const blobService = new BlobServiceClient(
        `https://${process.env.STORAGE_ACCOUNT}.blob.core.windows.net`,
        sharedKeyCredential
    )

    const filename = `${seed}/${userIdentifier}-${new Date()}.json`

    const firehoseContainerClient = blobService.getContainerClient(FirehoseRecordingContainerName)
    const createContainerResponse = await firehoseContainerClient.create()
    console.log(createContainerResponse)

    uploadText(json, filename, firehoseContainerClient)

    // Non-Playfab users can still get shoved in the firehose bucket, but they can't show up in others' games.
    if (data.playfabUser && playfabId) {
        const containerClient = blobService.getContainerClient(RecordingContainerName)
        const createContainerResponse = await containerClient.create()
        console.log(createContainerResponse)

        // Only the first N seeds per hour get collated into real in-game ghost data
        const blobs = await containerClient.listBlobsFlat()

        // This is very silly.
        let count = 0
        for await (const _ of blobs) {
            count++
        }

        if (count < numberOfReplaysPerSeed) {
            uploadText(json, filename, containerClient)
        }

        // Upload stats
        const { stats, userData } = await replayDataToStats(replay, playfabId)
        if (stats) {
            const statsArray = []
            for (const key in stats) {
                statsArray.push({
                    StatisticName: key,
                    Value: (stats as any)[key]
                })
            }
            await playfabPromisify(PlayFabServer.UpdatePlayerStatistics)({
                PlayFabId: playfabId,
                Statistics: statsArray
            })
        }

        if (userData) {
            await playfabPromisify(PlayFabServer.UpdateUserData)({
                PlayFabId: playfabId,
                Data: userData
            })
        }

        context.res = {
            status: 200
        }
    } else {
        context.res = {
            status: 200,
            body: { success: true }
        }
    }
}

export default httpTrigger

const replayDataToStats = async (
    replay: ReplayUploadRequest,
    playfabId: string
): Promise<{
    stats?: Partial<PlayfabUserStats>
    userData?: { scoreHistory: string; winStreak: number }
}> => {
    // Guard against old clients without valid stats data
    if (_.isUndefined(replay.opponents) || _.isUndefined(replay.time) || _.isUndefined(replay.position)) {
        console.log(
            `User '${playfabId}' did not send valid stats data, ${replay.opponents}, ${replay.time}, ${replay.position}`
        )
        return {}
    }

    const { position, data, opponents, mode, time } = replay
    const { actions, score } = data

    // Fetch and increment score history
    const historyRequest = await playfabPromisify(PlayFabServer.GetUserData)({
        PlayFabId: playfabId,
        Keys: ["scoreHistory", "winStreak"]
    })
    let scoreHistory: number[] = []
    let winStreak = 0

    if (historyRequest.data && historyRequest.data.Data) {
        if (historyRequest.data.Data.scoreHistory && historyRequest.data.Data.scoreHistory.Value) {
            scoreHistory = JSON.parse(historyRequest.data.Data.scoreHistory.Value!) || []
        }

        if (historyRequest.data.Data.scoreHistory && historyRequest.data.Data.winStreak.Value) {
            winStreak = parseInt(historyRequest.data.Data.winStreak.Value!) || 0
        }
    }

    scoreHistory.unshift(score)

    const RoyaleMode = 1
    const TrialMode = 2

    let result: Partial<PlayfabUserStats> = {
        BestPosition: position,
        BirdsPast: opponents - position,
        Crashes: position === 0 && mode === RoyaleMode ? 0 : 1,
        FirstPipeFails: score < 1 ? 1 : 0,
        Flaps: actions.filter(a => a.action === "flap").length,
        Score: score,
        TotalGamesPlayed: 1,
        TotalScore: score,
        TotalTimeInGame: time || 0
    }

    if (mode === TrialMode) {
        result["DailyTrial-1"] = data.score
    } else if (mode === RoyaleMode) {
        result.RoyaleGamesPlayed = 1
        if (position === 0 && opponents > 0) {
            winStreak += 1
            result.RoyaleGamesWon = 1
            result.RoyaleWinStreak = winStreak
            result.CurrentRoyaleStreak = winStreak
        } else {
            result.CurrentRoyaleStreak = 0
            winStreak = 0
        }
    }

    return {
        stats: result,
        userData: {
            scoreHistory: JSON.stringify(scoreHistory),
            winStreak
        }
    }
}
