import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import _ = require("lodash")
import playfabPromisify from "src/playfabPromisify"
import { PlayFabServer } from "playfab-sdk"
import setUpPlayfab from "src/setUpPlayfab"

export interface AttireChangeRequest {
    playfabId: string
    attireIds: string[] // Attire IDs
}

const httpTrigger: AzureFunction = async function(context: Context, req: HttpRequest): Promise<void> {
    const { playfabId, attireIds } = JSON.parse(context.req.body) as AttireChangeRequest

    setUpPlayfab()

    const inventory = (await playfabPromisify(PlayFabServer.GetCatalogItems)({})).data.Catalog
    if (!inventory) {
        context.res = {
            status: 500,
            body: { error: "Could not fetch inventory catalog" }
        }
        return
    }

    const attire: PlayFabAdminModels.CatalogItem[] = attireIds.map(id => {
        return inventory.find(i => i.ItemId === id)!
    })

    if (attire.length !== attireIds.length) {
        context.res = {
            status: 500,
            body: { error: "Could not find at least one item" }
        }
        return
    }

    const data = (await playfabPromisify(PlayFabServer.GetUserData)({
        PlayFabId: playfabId
    })).data.Data

    if (!data && data!.unlockedAttire && data!.unlockedAttire.Value) {
        context.res = {
            status: 500,
            body: { error: "Could not fetch player inventory" }
        }
        return
    }

    const playerInventory = data!.unlockedAttire.Value!.split(",")

    let allAttireIsValid = true

    for (const a of attire) {
        // Let's assume anything with no price set is free
        if (!a.VirtualCurrencyPrices) {
            continue
        }

        // Otherwise, something with an explicit price of 0 is free
        if (a.VirtualCurrencyPrices && a.VirtualCurrencyPrices.RM === 0) {
            continue
        }

        // If it is a loot box item, the user might own it!
        if (_.includes(playerInventory, a.ItemId)) {
            continue
        }

        allAttireIsValid = false
    }

    if (!allAttireIsValid) {
        context.res = {
            status: 403,
            body: { error: "Player tried to wear attire they did not have access to" }
        }
        return
    }

    // TODO: How do we verify that the given user actually made this request themselves?
    await playfabPromisify(PlayFabServer.UpdateAvatarUrl)({
        ImageUrl: attire.map(a => a.ItemId).join(","),
        PlayFabId: playfabId
    })

    context.res = {
        status: 204
    }
}

export default httpTrigger
