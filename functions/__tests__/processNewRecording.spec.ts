import { processNewRecording, maxNumberOfReplays } from "../src/processNewRecording";
import { PlayerDataFactory } from "../testUtils/factories";
import { PlayerData, SeedData } from "../../src/firebase";



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
        for (let i = 0; i < maxNumberOfReplays + 1; i++) {
          replays.push(PlayerDataFactory({ score: i + 10 }, `player-${i}`))
        }
        const start = { replays }
        const toAdd = PlayerDataFactory({ score: 1 })
        const result = processNewRecording(start, toAdd, toAdd.user.name, 2)

        expect(result.replays).toHaveLength(maxNumberOfReplays)
        expect(result.replays).not.toContain(toAdd)
      })
    })
  })

  describe("royale", () => {
    describe("when there are 0 recordings", () => {
      it("should add the recording", () => {
        const empty = { replays: [] }
        const toAdd = PlayerDataFactory()
        const result = processNewRecording(empty, toAdd, toAdd.user.name, 1)
        expect(result).toEqual({ replays: [toAdd] })
      })
    })

    describe("when there are < 50% of recordings", () => {
      const empty = { replays: [] }
      const toAdd = PlayerDataFactory()
      const result = processNewRecording(empty, toAdd, toAdd.user.name, 1)
      expect(result).toEqual({ replays: [toAdd] })
    })

    describe("when there are 50% < x < 100% of recordings", () => {
      describe("when the player hasn't contributed before", () => {
        it("should append to the list of recordings", () => {
          let replays: PlayerData[] = []
          for (let i = 0; i < maxNumberOfReplays / 2 + 1; i++) {
            replays.push(PlayerDataFactory({ score: i + 10 }, `player-${i}`))
          }

          const toAdd = PlayerDataFactory({}, "player-9999")
          const result = processNewRecording({ replays }, toAdd, toAdd.user.name, 1)

          expect(result.replays).toHaveLength(maxNumberOfReplays / 2 + 2)
          expect(result.replays).toContainEqual(toAdd)
        })
      })

      describe("when this player has already contributed a recording", () => {
        let replays: PlayerData[]
        let toAdd: PlayerData
        let result: SeedData

        beforeEach(() => {
          replays = []
          for (let i = 0; i < maxNumberOfReplays / 2 + 1; i++) {
            replays.push(PlayerDataFactory({}, `player-${i}`))
          }

          replays.push(PlayerDataFactory({}, "player-10"))

          toAdd = PlayerDataFactory({}, "player-10")
          result = processNewRecording({ replays }, toAdd, toAdd.user.name, 1)
        })

        it("should have the same number of recordings", () => {
          expect(result.replays).toHaveLength(maxNumberOfReplays / 2 + 2)
        })

        it("should wipe out an older recording by the same player", () => {
          const byPlayer = result.replays.filter(r => r.user.name === toAdd.user.name)
          expect(byPlayer).toHaveLength(2)
          expect(byPlayer).toContainEqual(toAdd)
        })
      })
    })

    describe("when there are already the max number of recordings", () => {
      let replays: PlayerData[]
      let toAdd: PlayerData
      let result: SeedData

      beforeEach(() => {
        replays = []
        for (let i = 0; i < maxNumberOfReplays; i++) {
          replays.push(PlayerDataFactory({}, `player-${i}`))
        }
      })

      describe("when the player hasn't contributed before", () => {
        it("should overwrite a random existing recording", () => {
          const toAdd = PlayerDataFactory({}, "player-9999")
          const result = processNewRecording({ replays }, toAdd, toAdd.user.name, 1)

          expect(result.replays).toHaveLength(maxNumberOfReplays)
          expect(result.replays).toContainEqual(toAdd)
        })
      })

      describe("when this player has already contributed a recording", () => {
        it("should overwrite one of that player's existing recordings", () => {
          replays.push(PlayerDataFactory({}, "player-10"))

          toAdd = PlayerDataFactory({}, "player-10")
          result = processNewRecording({ replays }, toAdd, toAdd.user.name, 1)

          expect(result.replays).toHaveLength(maxNumberOfReplays + 1)
          expect(result.replays).toContainEqual(toAdd)

          const byPlayer = result.replays.filter(r => r.user.name === toAdd.user.name)
          expect(byPlayer).toHaveLength(2)
        })
      })
    })
  })
})
