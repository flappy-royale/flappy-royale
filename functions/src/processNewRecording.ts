import { SeedData, PlayerData } from "../../src/firebase";

const maxNumberOfReplays = 100

export const processNewRecording = (seedData: SeedData, data: PlayerData, uuid: string, mode: number): SeedData => {
  const existingCount = seedData.replays.length
  const shouldUpdateNotAdd = existingCount < maxNumberOfReplays
  const hasOverHalfData = existingCount > maxNumberOfReplays / 2

  // Do we want to keep the top of all time
  const highScoresOnly = mode === 2
  if (highScoresOnly) {
    seedData.replays = processHighScore(seedData, data)
  } else if (hasOverHalfData && shouldUpdateNotAdd) {
    // One user can ship many replays until there is over half
    // the number of max replays
    // TODO: Add a real UUID for the user?
    const hasUserInData = seedData.replays.findIndex(d => d.user.name == uuid)
    const randomIndexToDrop = Math.floor(Math.random() * existingCount)
    const index = hasOverHalfData && hasUserInData !== -1 ? hasUserInData : randomIndexToDrop
    seedData.replays[index] = data
  } else {
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