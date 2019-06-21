import { analyticsEvent } from "./analytics"

interface ScreenshotableScreen extends Phaser.Scene {
    showScreenshotUI: () => void
    removeScreenshotUI: () => void
}

export function shareNatively(copy: string, scene: ScreenshotableScreen) {
    analyticsEvent("share", {})

    if (window.isAppleApp) {
        scene.showScreenshotUI()

        setTimeout(() => {
            window.webkit.messageHandlers.shareScreenshot.postMessage(copy)
        }, 100)

        window.addEventListener(
            "screenshotComplete",
            () => {
                scene.removeScreenshotUI()
            },
            { once: true }
        )
    } else if (window.Sharing) {
        scene.showScreenshotUI()
        setTimeout(() => {
            window.Sharing.shareScreenshot(copy)
        }, 100)

        window.addEventListener(
            "screenshotComplete",
            () => {
                scene.removeScreenshotUI()
            },
            { once: true }
        )
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
