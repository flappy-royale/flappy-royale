export function requestReview() {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.requestReview.postMessage(true)
    } else if (window.URLLoader && window.URLLoader.requestReview) {
        window.URLLoader.requestReview()
    } else {
        console.log("Requesting app store review!")
    }
}
