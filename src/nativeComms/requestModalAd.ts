import { analyticsEvent } from "./analytics"

export function requestModalAd(adID: string) {
    analyticsEvent("watching_ad", { id: adID })

    if (window.isAppleApp) {
        window.webkit.messageHandlers.adManager.postMessage(JSON.stringify({ show_id: adID }))
    } else if (window.ModalAdPresenter) {
        // Android!
        if (window.ModalAdPresenter.requestAdWithID) window.ModalAdPresenter.requestAdWithID(adID)
    } else {
        console.log("Requesting a modal ad!")
    }
}

// If we're in a situation where the user can view a reward ad, let's preload it
export function prepareModalAd(adID: string) {
    analyticsEvent("preloading_ad", { id: adID })

    if (window.isAppleApp) {
        // TODO: Actually prepare on iOS
        window.webkit.messageHandlers.adManager.postMessage(JSON.stringify({ prepare_id: adID }))
    } else if (window.ModalAdPresenter) {
        // Android!
        if (window.ModalAdPresenter.prepareAdWithID) window.ModalAdPresenter.prepareAdWithID(adID)
    } else {
        console.log("Preparing to maybe show an ad!")
    }
}
