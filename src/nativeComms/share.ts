export function shareNatively(copy: string) {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.shareScreenshot.postMessage(copy)
    } else {
        if (navigator && "share" in navigator) {
            const n = navigator as any

            n.share({
                title: "Flappy Royale",
                text: copy,
                url: "https://flappyroyale.io"
            })
        }
    }
}
