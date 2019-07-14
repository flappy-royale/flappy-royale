import { lookupBoxesForTiers } from "../../assets/config/playfabConfig"
import { LootboxTier } from "../../src/attire"
import _ = require("lodash")

export const getItemFromLootBoxStartingWith = (
    initialTier: LootboxTier,
    allPlayfabTables: PlayFabAdminModels.RandomResultTableListing[],
    playerInventoryIDs: string[]
) => {
    const getItemForTableID = (tier: LootboxTier): undefined | PlayFabServerModels.ResultTableNode => {
        const id = lookupBoxesForTiers[tier]
        const table = allPlayfabTables.find(t => t.TableId === id)
        if (!table) {
            if (process.env.JEST_WORKER_ID === undefined) console.error(`Could not find a table for ${id}`)
            return undefined
        }

        // Remove all items the player already has
        const availableNodes = table.Nodes.filter(n => !_.includes(playerInventoryIDs, n.ResultItem))
        if (availableNodes.length === 0) {
            return undefined
        }

        return _.sample(availableNodes)
    }

    if (initialTier === -1) return // Should never happen, but narrows the LootboxTier union to less members

    const item = getItemForTableID(initialTier)
    if (item) return item

    // First look downwards so you get the rarest first
    const walkDownFirst = [3, 2, 1, 0] as const
    const currentIndex = walkDownFirst.indexOf(initialTier)
    for (let i = currentIndex; i < walkDownFirst.length; i++) {
        const tier = walkDownFirst[i]
        const item = getItemForTableID(tier)
        if (item) return item
    }

    const walkUp = [1, 2, 3] as const
    for (let i = 0; i < walkUp.length; i++) {
        const tier = walkUp[i]
        const item = getItemForTableID(tier)
        if (item) return item
    }

    return undefined
}
