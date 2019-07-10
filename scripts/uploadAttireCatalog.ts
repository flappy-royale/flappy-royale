import { PresentationAttire } from "../src/attire"
import { PlayFabAdmin } from "playfab-sdk"
import { playfabFirebaseProdSecretKey } from "../assets/config/playfabServerConfig"
import { titleId } from "../assets/config/playfabConfig"
import playfabPromisify from "../src/playfabPromisify"
import { AttireSet } from "../src/attire/attireSets"

/** TODO: This conceptually belongs in `scripts`
 * However, I was running into import issues, where attire's require("some_image_url") was resolving to an actual image instead of a URL,
 * and thus blowing up outside the context of our webpack config.
 *
 * For now, I'm running this by copy/pasting into the src/ directory and triggering with local client code. Not great.
 */
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
        IsTradable: false
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
    console.log({
        Catalog: items.map(attireToCatalogItem)
    })
    const result = await playfabPromisify(PlayFabAdmin.SetCatalogItems)({
        Catalog: items.map(attireToCatalogItem)
    })
    console.log(result)
}

// WARNING: This currently only works with a single set of attire, and doesn't do what you want
// Namely, the entire Catalog will be JUST this set, wiping away all other sets
// Future work for Em when we have two sets: this should take in an array of AttireSets.
// setEntireAttire should be passed the combination of all of those attire sets' attire, then we call SetStoreItems on each set.
export const setAttireSet = async (set: AttireSet) => {
    await setEntireAttire(set.attire)
    await playfabPromisify(PlayFabAdmin.SetStoreItems)({
        StoreId: set.id,
        Store: set.attire.map(attireToStoreItem),
        MarketingData: attireSetToStore(set)
    })
}
