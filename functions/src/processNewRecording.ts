import { SeedData, PlayerData } from "../../src/firebase";

export const maxNumberOfReplays = 100

export const processNewRecording = (seedData: SeedData, data: PlayerData, uuid: string, mode: number): SeedData => {
  const existingCount = seedData.replays.length
  const hasAtLeastHalfReplays = existingCount > maxNumberOfReplays / 2
  const hasMaxReplays = existingCount >= maxNumberOfReplays

  const highScoresOnly = mode === 2
  if (highScoresOnly) {
    seedData.replays = processHighScore(seedData, data)
  } else if (hasAtLeastHalfReplays && !hasMaxReplays) {
    const previousContributionByPlayer = seedData.replays.findIndex(d => d.user.name == uuid)
    if (previousContributionByPlayer === -1) {
      // Player hasn't contributed yet, just add it!
      seedData.replays.push(data)
    } else {
      // Wipe out one of the player's previous recordings
      seedData.replays[previousContributionByPlayer] = data
    }
  } else if (hasMaxReplays) {
    const previousContributionByPlayer = seedData.replays.findIndex(d => d.user.name == uuid)
    if (previousContributionByPlayer === -1) {
      const randomIndex = Math.floor(Math.random() * existingCount)
      seedData.replays[randomIndex] = data
    } else {
      seedData.replays[previousContributionByPlayer] = data
    }
  } else { // When < 50% of recordings exist, always just push it on
    seedData.replays.push(data)
  }

  return seedData
}


const processHighScore = (seedData: SeedData, data: PlayerData): PlayerData[] => {
  // Contains the single best score this user has submitted,
  // whether it's the one we're trying to submit now or a previous one
  // (although they _should_ have at most 1 previous entry in the list)
  const currentPlayerReplays = seedData.replays
    .filter(replay => replay.user.name === data.user.name)
    .concat(data)
    .sort((l, r) => l.score - r.score)
  const personalBest = currentPlayerReplays[currentPlayerReplays.length - 1]

  // Grab all replays that aren't by this user,
  // add in their best (which might or might not have been previously there),
  // sort it in descending order,
  // then truncate it to the length we want the list to be.
  const sortedReplays = seedData.replays
    .filter(replay => replay.user.name !== data.user.name)
    .concat(personalBest)
    .sort((l, r) => l.score - r.score)
    .reverse()
    .slice(0, maxNumberOfReplays)

  return sortedReplays
}