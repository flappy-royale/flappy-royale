import { LifeStateForSeed } from "../user/userManager"
import { analyticsEvent } from "./analytics"

export function requestModalAd(current: LifeStateForSeed) {
    analyticsEvent("watching_ad", { state: current })

    if (window.isAppleApp) {
        window.webkit.messageHandlers.adManager.postMessage(current)
    } else if (window.ModalAdPresenter) { // Android!
        window.ModalAdPresenter.requestAd(current)
    } else {
        console.log("Requesting app store review!")
    }
}
