import { PresentationAttire } from "../attire"
import { PlayFabAdmin } from "playfab-sdk"
import { playfabFirebaseProdSecretKey } from "../../assets/config/playfabServerConfig"
import { titleId } from "../../assets/config/playfabConfig"
import playfabPromisify from "../playfabPromisify"
import { AttireSet, allAttireSets } from "../attire/attireSets"
import _ = require("lodash")
import { defaultAttireSet } from "../attire/defaultAttireSet"

PlayFabAdmin.settings.developerSecretKey = playfabFirebaseProdSecretKey
PlayFabAdmin.settings.titleId = titleId

const attireToCatalogItem = (item: PresentationAttire): PlayFabAdminModels.CatalogItem => {
    let tags: string[] = [item.fit]
    if (item.base) {
        tags.push("base")
    }

    const itemClass = item.base ? "base" : item.fit

    return {
        ItemId: item.id,
        ItemImageUrl: item.href, // This isn't used in-game anywhere
        Tags: tags,
        Description: item.description,
        ItemClass: itemClass,

        CanBecomeCharacter: false,
        InitialLimitedEditionCount: 0,
        IsLimitedEdition: false,
        IsStackable: false,
        IsTradable: false,

        VirtualCurrencyPrices: {
            RM: item.free ? 0 : 1
        }
    }
}

const attireToStoreItem = (attire: PresentationAttire): PlayFabAdminModels.StoreItem => {
    return {
        ItemId: attire.id,
        VirtualCurrencyPrices: {
            RM: attire.free ? 0 : 1
        }
    }
}

const attireSetToStore = (set: AttireSet): PlayFabAdminModels.StoreMarketingModel => {
    return {
        DisplayName: set.name,
        Metadata: {
            attributedTo: set.attributedTo,
            attributedURL: set.attributedURL,
            iconPath: set.iconPath,
            lightHexColor: set.lightHexColor,
            darkHexColor: set.darkHexColor
        }
    }
}

const attireSetLootBoxTable = (set: AttireSet): PlayFabAdminModels.RandomResultTable => {
    const weightMap = {
        "-1": 0,
        1: 70,
        2: 50,
        3: 30
    }
    return {
        Nodes: set.attire.map(a => ({
            ResultItem: a.id,
            ResultItemType: "ItemId",
            Weight: weightMap[a.tier]
        })),
        TableId: set.id + "-loot"
    }
}

const setEntireAttire = async (items: PresentationAttire[]) => {
    const catalogue = items.map(attireToCatalogItem)
    return await playfabPromisify(PlayFabAdmin.SetCatalogItems)({
        Catalog: catalogue
    })
}

export const setAttireSets = async (sets: AttireSet[]) => {
    const allAttire = _.uniq(_.flatten(sets.map(s => s.attire)))

    await setEntireAttire(allAttire)

    // These need to be serial, not parallel, or PlayFab will yell at us.
    // Note - sometimes it will yell anyway, re-run and it'll probably work.
    for (let set of sets) {
        await playfabPromisify(PlayFabAdmin.SetStoreItems)({
            StoreId: set.id,
            Store: set.attire.map(attireToStoreItem),
            MarketingData: attireSetToStore(set)
        })

        if (set.id !== defaultAttireSet.id) {
            await playfabPromisify(PlayFabAdmin.UpdateRandomResultTables)({
                Tables: [attireSetLootBoxTable(set)]
            })
        }
    }
}

// TO RUN THIS:
// For now, I just go into app.ts and shove this call into the critical path.
// Could/should eventually make an admin page, but I can't be bothered right now.
// If we do, we want to make *sure* none of this code gets bundled into a production build,
// since it includes our developer secret key
export const updateAllAttireCatalogue = async () => {
    setAttireSets(allAttireSets)
}
