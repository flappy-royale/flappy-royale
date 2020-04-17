import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import _ = require("lodash")
import { PlayFabServer } from "playfab-sdk"

import playfabPromisify from "../src/playfabPromisify"
import setUpPlayfab from "../src/setUpPlayfab"

const httpTrigger: AzureFunction = async function(context: Context, req: HttpRequest): Promise<void> {
    const { playfabId, attireIds } = context.req.body

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

    if (!data) {
        context.res = {
            status: 500,
            body: "Could not fetch User Data"
        }
        return
    }

    // If a user has not unlocked any attire, it's likely their unlockedAttire attribute will be empty and this will error out
    // The issue is that, on updating attire on the client, we fire off this API request and a PlayFab request to update the user settings in parallel, so this code fires before PlayFab has had an empty array set.
    // Let's just manually set that here for now. If a user's data isn't coming through properly, it's probably safer to assume they have nothing unlocked than to error out silently.
    const attireString = data.unlockedAttire && data.unlockedAttire!.Value ? data.unlockedAttire.Value : ""
    const playerInventory = attireString.split(",")

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
