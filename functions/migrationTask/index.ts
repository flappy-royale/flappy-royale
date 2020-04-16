import { AzureFunction, Context } from "@azure/functions"
import { StorageSharedKeyCredential, BlobServiceClient, BlobClient } from "@azure/storage-blob"
import _ = require("lodash")

import getSeeds from "../src/getSeeds"
import { APIVersion, numberOfReplaysPerSeed, RecordingContainerName } from "../src/constants"
import { PlayerData, JsonSeedData, SeedDataZipped, SeedData } from "../../src/serverTypes"
import { zippedObj, unzip } from "../src/compression"

const unzipSeedData = (seed: SeedDataZipped): SeedData => {
    return {
        replays: unzip(seed.replaysZipped)
    }
}

// From https://github.com/Azure/azure-sdk-for-js/tree/master/sdk/storage/storage-blob
async function streamToString(readableStream): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks = []
        readableStream.on("data", data => {
            chunks.push(data.toString())
        })
        readableStream.on("end", () => {
            resolve(chunks.join(""))
        })
        readableStream.on("error", reject)
    })
}

const timerTrigger: AzureFunction = async function(context: Context, myTimer: any): Promise<void> {
    const seeds = getSeeds(APIVersion)
    const allSeeds = [...seeds.royale, seeds.daily.dev, seeds.daily.production, seeds.daily.staging]

    const getReplayJsonFromBlobClient = async (blob: BlobClient): Promise<PlayerData[]> => {
        try {
            const blobResponse = await blob.download()
            const downloaded = await streamToString(blobResponse.readableStreamBody)
            console.log("Downloaded blob content:", downloaded)

            const json = JSON.parse(downloaded)
            return unzipSeedData(json).replays
        } catch (error) {
            return []
        }
    }

    const expiry = new Date()
    expiry.setHours(expiry.getHours() + 1)
    expiry.setMinutes(expiry.getMinutes() + 1) // Might as well give ourselves some slack

    const sharedKeyCredential = new StorageSharedKeyCredential(
        process.env.STORAGE_ACCOUNT,
        process.env.STORAGE_ACCOUNT_KEY
    )
    const blobService = new BlobServiceClient(
        `https://${process.env.STORAGE_ACCOUNT}.blob.core.windows.net`,
        sharedKeyCredential
    )
    const container = blobService.getContainerClient(RecordingContainerName)

    for (const seed of allSeeds) {
        const collatedName = `${seed}.json`

        const replayFile = await container.getBlobClient(collatedName)
        let replays: PlayerData[] = await getReplayJsonFromBlobClient(replayFile)

        const fileIter = await container.listBlobsFlat({ prefix: `${seed}/` })
        let rawReplays = []
        let replayNames = []
        for await (const blob of fileIter) {
            console.log(blob)
            const actualBlob = await container.getBlobClient(blob.name)
            rawReplays.push(await getReplayJsonFromBlobClient(actualBlob))
            replayNames.push(blob.name)
        }

        // This will take each file, download it, and unzip its replays
        // giving us an array of arrays each with a single replay
        const newReplays = _.flatten(rawReplays)

        // We want to limit the number of replays, but also prioritize new replays
        replays = [...newReplays, ...replays]
        replays = replays.slice(0, numberOfReplaysPerSeed)

        const newData: JsonSeedData = { replaysZipped: zippedObj(replays), expiry: expiry.toJSON() }
        const newDataString = JSON.stringify(newData)

        const uploadBlobClient = container.getBlockBlobClient(collatedName)
        await uploadBlobClient.upload(newDataString, newDataString.length)

        for await (const name of replayNames) {
            await container.deleteBlob(name)
        }
    }

    var timeStamp = new Date().toISOString()

    if (myTimer.isPastDue) {
        context.log("Timer function is running late!")
    }
    context.log("Timer trigger function ran!", timeStamp)
}

export default timerTrigger
