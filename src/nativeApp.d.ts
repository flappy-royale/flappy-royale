import { haptics } from "./haptics"
import { requestReview } from "./nativeComms/requestReview"

interface PlayfabAuth {
    method: string
    payload: any
}

declare global {
    interface Window {
        // The timestamp the last time the app lost focus
        // Used to determine when to force-reload the app
        dateLastHidden?: Date

        // iOS
        isAppleApp: boolean
        webkit: {
            messageHandlers: { [key: string]: WebkitHandler }
        }

        /** Like 15 or something */
        buildVersion: string
        /** Release version, e.g. 1.1 */
        appVersion: string

        // Android
        ModalAdPresenter?: {
            requestAd?: (currentState: number) => void
            requestAdWithID?: (adID: string) => void
            prepareAd?: (currentState: number) => void
            prepareAdWithID?: (adID: string) => void
        }

        Analytics?: {
            event?: (name: string, params: any) => void
            userProperty?: (name: string, value: string) => void
            setId?: (id: string) => void
        }

        Sharing?: {
            shareScreenshot: (name: string) => void
        }

        URLLoader?: {
            openURL?: (url: string) => void
            openPlayStoreURL?: (url: string) => void
            requestReview?: () => void
        }

        LoadingManager?: {
            gameLoaded: () => void
        }

        GooglePlayGames?: {
            auth(): () => void
        }

        ga?(id: "send", event: "event", category: string, action: string, label: string, value?: number): void

        playfabAuth?: PlayfabAuth

        AndroidStaticData?: { fetch: () => string }
        notchOffset?: number
    }
}

interface WebkitHandler {
    postMessage: (args: string | integer | boolean) => void
}
