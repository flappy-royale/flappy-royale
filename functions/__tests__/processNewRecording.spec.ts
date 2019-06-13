import { processNewRecording } from "../src/processNewRecording";
import { PlayerData } from "../../src/firebase";
import { UserSettings } from "../../src/user/userManager";
import { Attire } from "../../src/attire";

// Loading the actual default attire requires resolving an image URL, 
// which requires going through the main app's webpack config. 
// Inlining this is easier.
const attireFactory = (props?: any): Attire => {
  return {
    ...props,
    id: "default-body",
    description: "It flaps",
    fit: "tight",
    base: true,
    href: "some URL"
  }
}
const userFactory = (props?: any): UserSettings => {
  return {
    ...props,
    name: "flappy bird",
    aesthetics: { attire: [attireFactory()] },
    royale: { seedIndex: -1 }
  }
}

describe("processNewRecording", () => {
  describe("high score", () => {
    describe("when there are not yet any scores", () => {
      it("should add the score", () => {
        const empty = { replays: [] }
        const toAdd: PlayerData = {
          user: userFactory("Alice"),
          actions: [],
          timestamp: 5,
          score: 5
        }
        const result = processNewRecording(empty, toAdd, toAdd.user.name, 2)
        expect(result).toEqual({ replays: [toAdd] })
      })
    })
  })
});
