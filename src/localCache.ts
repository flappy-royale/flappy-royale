import { SeedsResponse } from "../functions/src/api-contracts";
import { SeedData, emptySeedData } from "./firebase";

export const cache = {
  setRecordings: (seed: string, data: SeedData) => {
    // TODO: Clean out old seeds if there are too many when storing a new one

    localStorage[`recordings-${seed}`] = JSON.stringify(data)
  },

  getRecordings: (seed: String): SeedData => {
    const data = localStorage[`recordings-${seed}`]
    if (data) {
      return JSON.parse(data)
    } else {
      return emptySeedData
    }
  },

  setSeeds: (apiVersion: string, seeds: SeedsResponse) => {
    localStorage.setItem("lastSeeds", JSON.stringify({
      apiVersion, seeds
    }))
  },

  getSeeds: (apiVersion: string): SeedsResponse | undefined => {
    const stringResult = localStorage.lastSeeds
    const result = JSON.parse(stringResult)

    if (result && result.apiVersion === apiVersion) {
      return result.seeds
    }
  }
}

