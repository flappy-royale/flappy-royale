import { PresentationAttire } from "../attire"
import { PlayFabAdmin } from "playfab-sdk"
import { playfabFirebaseProdSecretKey } from "../../assets/config/playfabServerConfig"
import { titleId } from "../../assets/config/playfabConfig"
import playfabPromisify from "../playfabPromisify"
import { AttireSet, allAttireSets } from "../attire/attireSets"
import _ = require("lodash")

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
        ItemImageUrl: item.href,
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

const setEntireAttire = async (items: PresentationAttire[]) => {
    return await playfabPromisify(PlayFabAdmin.SetCatalogItems)({
        Catalog: items.map(attireToCatalogItem)
    })
}

export const setAttireSets = async (sets: AttireSet[]) => {
    const allAttire = _.flatten(sets.map(s => s.attire))
    await setEntireAttire(allAttire)

    // These need to be serial, not parallel, or PlayFab will yell at us.
    for (let set of sets) {
        await playfabPromisify(PlayFabAdmin.SetStoreItems)({
            StoreId: set.id,
            Store: set.attire.map(attireToStoreItem),
            MarketingData: attireSetToStore(set)
        })
    }
}

// TO RUN THIS:
// For now, I just go into app.ts and shove this call into the critical path.
// Could/should eventually make an admin page, but I can't be bothered right now.
// If we do, we want to make *sure* none of this code gets bundled into a production build,
// since it includes our deveoper secret key
export const setAllAttireSets = async () => {
    setAttireSets(allAttireSets)
}
