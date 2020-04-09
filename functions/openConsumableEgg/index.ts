import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { PlayFabServer } from "playfab-sdk"

import { ConsumeEggRequest } from "src/api-contracts"
import playfabPromisify from "src/playfabPromisify"
import { getItemFromLootBoxStartingWith } from "src/getItemFromLootBox"
import { attireIDToUUIDMap } from "src/attireIDToUUID.derived"
import setUpPlayfab from "src/setUpPlayfab"
import lookupBoxesForTiers from "src/lookupBoxesForTiers"

const httpTrigger: AzureFunction = async function(context: Context, req: HttpRequest): Promise<void> {
    const { tier, playfabId } = JSON.parse(context.req.body) as ConsumeEggRequest

    setUpPlayfab()

    ////
    ////  Step 1, grab all of the inventory - this is used in 2 ways
    ////    - Confirming you have an egg to consume
    ////    - Filtering out taken options for the lootbox
    ////

    const inventoryData = (await playfabPromisify(PlayFabServer.GetUserData)({
        PlayFabId: playfabId
    })).data.Data

    console.log("INVENTORY DATA", playfabId, inventoryData)

    let inventoryIds: string[]

    if (inventoryData && inventoryData!.unlockedAttire && inventoryData!.unlockedAttire!.Value) {
        console.log("InventoryData exists!")
        inventoryIds = inventoryData!.unlockedAttire!.Value!.split(",")
        console.log(inventoryIds)
    } else {
        // Temporary (or "temporary", lol) support for older clients that haven't backfilled user inventory in userData
        // Eventually, we won't care about supporting UserInventory items
        // and can fall straight back to 500-ing if userData lookup fails.

        const inventoryResult = await playfabPromisify(PlayFabServer.GetUserInventory)({ PlayFabId: playfabId })
        const inventory = inventoryResult.data.Inventory
        if (!inventory) {
            context.res = {
                status: 500,
                body: { error: "Could not fetch inventory for player" }
            }
            return
        }

        inventoryIds = inventory.map(i => i.ItemId).filter(Boolean) as string[]
    }

    if (!inventoryIds) {
        context.res = {
            status: 400,
            body: { error: "Could not fetch player inventory" }
        }
        return
    }

    ////
    ////  Step 2, grab all of the loot tables which are sets of tiered loot
    ////
    const lootTables = await playfabPromisify(PlayFabServer.GetRandomResultTables)({
        TableIDs: Object.values(lookupBoxesForTiers)
    })

    if (!lootTables.data.Tables) {
        context.res = {
            status: 400,
            body: { error: "Could not fetch drop tables" }
        }
        return
    }

    ////
    ////  Step 3, roll the dice
    ////

    // "egg-3".split("egg-") > [ '', '3' ]
    const initialTier = tier
    const rewardedItem = getItemFromLootBoxStartingWith(
        initialTier,
        Object.values(lootTables.data.Tables),
        inventoryIds
    )

    if (!rewardedItem) {
        // You've unlocked them all. Congrats. You should never
        // get here because you won't get a consumable egg, but best to be prepared
        context.res = {
            status: 204,
            body: { item: null }
        }
        return
    }

    ////
    ////  Step 4, Get the UUID for the item, and migrate to uuids if we need to
    ////

    // Handle case where migration went wrong:
    //
    // e.g. [object Undefined],[object Undefined],[object Undefined],[object Undefined],[object Undefined],[object Undefined],[object Undefined]
    if (inventoryIds[0] && isNaN(Number(inventoryIds[0]))) {
        inventoryIds = inventoryIds.map(id => {
            if (id === "[object Undefined]") {
                return Math.floor(Math.random() * 200).toString()
            }
            return id
        })
    }

    if (inventoryIds[0] && isNaN(Number(inventoryIds[0]))) {
        inventoryIds = inventoryIds.map(id => attireIDToUUIDMap[id] || id).map(toString)
    }

    // Get the new UUID
    const unlockedAttireUUID = attireIDToUUIDMap[rewardedItem.ResultItem].toString()

    ////
    ////  Step 5, Grant the new item
    ////
    await playfabPromisify(PlayFabServer.UpdateUserData)({
        PlayFabId: playfabId,
        Data: { unlockedAttire: [...inventoryIds, unlockedAttireUUID].join(",") }
    }).catch(e => {
        context.res = {
            status: 400,
            body: { error: "Could not grant item to user" }
        }
        return
    })

    context.res = {
        status: 200,
        body: { item: rewardedItem.ResultItem }
    }
}

export default httpTrigger
