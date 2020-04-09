// TODO: Right now, if we bump this in the app, we need to bump this here
// and we'll probably forget to do that!!
export const APIVersion = "1"

// IF YOU BUMP THIS:
// Even after 100 people play a new seed, that won't update for everyone until the migration task runs.
// After deploying, wait a few minutes and do this manually
// (click the "..." icon next to Firebase -> Functions -> migrateReplaysFromDbToJson, then "Open in Cloud Scheduler". Click "Run now")
export const numberOfRoyaleSeeds = 50

export const numberOfReplaysPerSeed = 200

// Magic strings for our Storage buckets
// "Firehose" = all recordings ever, regular = just the current batch to be collated
export const RecordingContainerName = "flappy-royale-replay-uploads"
export const FirehoseRecordingContainerName = "flappy-royale-replay-firehose"
