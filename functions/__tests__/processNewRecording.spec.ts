import { processNewRecording } from "../src/processNewRecording";
import { PlayerDataFactory } from "../testUtils/factories";



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
  })
});
