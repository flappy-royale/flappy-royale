import { getItemFromLootBoxStartingWith } from "../src/getItemFromLootBox"
import { lookupBoxesForTiers } from "../../assets/config/playfabConfig"
import { LootboxTier } from "../../src/attire"

const table = (tier: LootboxTier, ids: string[]) => {
    return {
        TableId: lookupBoxesForTiers[tier],
        Nodes: ids.map(i => ({ ResultItem: i, ResultItemType: "ItemId", Weight: 20 }))
    }
}

describe("getItemFromLootBoxStartingWith", () => {
    it("handles empty objects", () => {
        const result = getItemFromLootBoxStartingWith(1, [], [])
        expect(result).toEqual(undefined)
    })

    it("handles will correctly return the only thing", () => {
        const result = getItemFromLootBoxStartingWith(1, [table(1, ["123"])], [])
        expect(result).toEqual({ ResultItem: "123", ResultItemType: "ItemId", Weight: 20 })
    })

    it("ignores things you own", () => {
        const result = getItemFromLootBoxStartingWith(1, [table(1, ["123"])], ["123"])
        expect(result).toEqual(undefined)
    })

    it("doesn't ignore all of it", () => {
        const result = getItemFromLootBoxStartingWith(1, [table(1, ["123", "321"])], ["123"])
        expect(result).toEqual({ ResultItem: "321", ResultItemType: "ItemId", Weight: 20 })
    })

    it("goes down tiers", () => {
        const result = getItemFromLootBoxStartingWith(1, [table(0, ["123"])], [])
        expect(result).toEqual({ ResultItem: "123", ResultItemType: "ItemId", Weight: 20 })
    })

    it("goes up after 0", () => {
        const result = getItemFromLootBoxStartingWith(1, [table(0, []), table(1, []), table(2, ["3"])], [])
        expect(result).toEqual({ ResultItem: "3", ResultItemType: "ItemId", Weight: 20 })
    })
})
