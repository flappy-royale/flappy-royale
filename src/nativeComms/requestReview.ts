export function requestReview() {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.requestReview.postMessage(true)
    } else {
        console.log("Requesting app store review!")
    }
}
