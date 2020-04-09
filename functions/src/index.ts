/// Careful with any ../ - you need to make sure they don't make contact with game-code

/**
 * Converts from the db representation where the seed data is gzipped into
 * a useable model JSON on the client
 */
// export const unzipSeedData = (seed: SeedDataZipped): SeedData => {
//     return {
//         replays: unzip(seed.replaysZipped)
//     }
// }

/**
const migrationTask = async () => {
    const seeds = getSeeds(APIVersion)
    const allSeeds = [...seeds.royale, seeds.daily.dev, seeds.daily.production, seeds.daily.staging]

    const getReplayJsonFromFile = async (file: File): Promise<PlayerData[]> => {
        try {
            const buffer = await file.download()
            const json = JSON.parse(buffer.toString())
            return unzipSeedData(json).replays
        } catch (error) {
            return []
        }
    }

    const expiry = new Date()
    expiry.setHours(expiry.getHours() + 1)
    expiry.setMinutes(expiry.getMinutes() + 1) // Might as well give ourselves some slack

    const bucket = admin.storage().bucket("flappy-royale-replays")
    const rawBucket = admin.storage().bucket("flappy-royale-replay-uploads")

    for (const seed of allSeeds) {
        const replayFile = bucket.file(`${seed}.json`)
        let replays: PlayerData[] = await getReplayJsonFromFile(replayFile)

        const [files] = await rawBucket.getFiles({ prefix: `${seed}/` })

        // This will take each file, download it, and unzip its replays
        // giving us an array of arrays each with a single replay
        const rawReplays = await Promise.all(files.map(getReplayJsonFromFile))
        const newReplays = _.flatten(rawReplays)

        // We want to limit the number of replays, but also prioritize new replays
        replays = [...newReplays, ...replays]
        replays = replays.slice(0, numberOfReplaysPerSeed)

        const newData: JsonSeedData = { replaysZipped: zippedObj(replays), expiry: expiry.toJSON() }
        await replayFile.save(JSON.stringify(newData))

        await rawBucket.deleteFiles({ prefix: `${seed}/` })
    }
}


export const migrateReplaysFromDbToJson = functions
    .runWith({ timeoutSeconds: 540, memory: "1GB" })
    .pubsub.schedule("every 1 hours")
    .onRun(async () => await migrationTask())

export const manualMigration = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        await migrationTask()

        return response.status(200).send({ success: true })
    })
})
*/

/*



*/
