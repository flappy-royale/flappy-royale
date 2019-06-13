import { processNewRecording } from "../src/processNewRecording";
import { PlayerDataFactory } from "../testUtils/factories";
import { PlayerData } from "../../src/firebase";



describe("processNewRecording", () => {
  describe("high score", () => {
    describe("when there are not yet any scores", () => {
      it("should add the score", () => {
        const empty = { replays: [] }
        const toAdd = PlayerDataFactory()
        const result = processNewRecording(empty, toAdd, toAdd.user.name, 2)
        expect(result).toEqual({ replays: [toAdd] })
      })
    })

    describe("when the player has already submitted a score", () => {
      it("should overwrite a lower score", () => {
        const lower = PlayerDataFactory({ score: 1 })
        const higher = PlayerDataFactory({ score: 5 })
        const other = PlayerDataFactory({ score: 3 }, "Orta")

        const start = { replays: [lower, other] }
        const result = processNewRecording(start, higher, lower.user.name, 2)
        expect(result).toEqual({ replays: [higher, other] })
      })

      it("should be ignored if the earlier score is higher", () => {
        const lower = PlayerDataFactory({ score: 1 })
        const higher = PlayerDataFactory({ score: 5 })
        const other = PlayerDataFactory({ score: 3 }, "Orta")

        const start = { replays: [higher, other] }
        const result = processNewRecording(start, lower, lower.user.name, 2)
        expect(result).toEqual({ replays: [higher, other] })
      })
    })

    describe("when we've reached the max number of scores", () => {
      it("should remove the lowest score", () => {
        let replays: PlayerData[] = []
        // Max = 100 currently (magic numbers!)
        for (let i = 0; i < 101; i++) {
          replays.push(PlayerDataFactory({ score: i }, `player-${i}`))
        }
        const start = { replays }
        const toAdd = PlayerDataFactory({ score: 50 })
        const result = processNewRecording(start, toAdd, toAdd.user.name, 2)

        expect(result.replays).toHaveLength(100)
        expect(result.replays).not.toContain(replays[0])
        expect(result.replays).toContain(toAdd)
      })

      it("should ignore the new score, if that's the lowest", () => {
        let replays: PlayerData[] = []
        // Max = 100 currently (magic numbers!)
        for (let i = 0; i < 101; i++) {
          replays.push(PlayerDataFactory({ score: i + 10 }, `player-${i}`))
        }
        const start = { replays }
        const toAdd = PlayerDataFactory({ score: 1 })
        const result = processNewRecording(start, toAdd, toAdd.user.name, 2)

        expect(result.replays).toHaveLength(100)
        expect(result.replays).not.toContain(toAdd)
      })
    })
  })
});
