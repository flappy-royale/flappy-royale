import { LifeStateForSeed } from "../user/userManager"

export function requestModalAd(current: LifeStateForSeed) {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.adManager.postMessage(current)
    } else {
        console.log("Requesting app store review!")
    }
}
