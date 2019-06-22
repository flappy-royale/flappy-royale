export function openURL(url: string) {
    if (window.isAppleApp) {
    } else if (window.Analytics) {
    } else {
        document.location.href = url
    }
}
