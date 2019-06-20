import { LifeStateForSeed } from "../user/userManager"
import { analyticsEvent } from "./analytics"

export function requestModalAd(current: LifeStateForSeed) {
    analyticsEvent("watching_ad", { state: current })

    if (window.isAppleApp) {
        window.webkit.messageHandlers.adManager.postMessage(current)
    } else if (window.ModalAdPresenter) { // Android!
        window.ModalAdPresenter.requestAd(current)
    } else {
        console.log("Requesting a modal ad!")
    }
}

// If we're in a situation where the user can view a reward ad, let's preload it
export function prepareModalAd(current: LifeStateForSeed) {
    analyticsEvent("preloading_ad", { state: current })

    if (window.isAppleApp) {
        // TODO: Actually prepare on iOS
        return
    } else if (window.ModalAdPresenter) { // Android!
        window.ModalAdPresenter.prepareAd(current)
    } else {
        console.log("Preparing to maybe show an ad!")
    }
}
