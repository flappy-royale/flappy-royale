// Needs to support both mailto:name@email.com and https://url.com
export function openURL(url: string) {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.openURL.postMessage(url)
    } else if (window.Analytics) {
    } else {
        document.location.href = url
    }
}
