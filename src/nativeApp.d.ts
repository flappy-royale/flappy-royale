import { haptics } from "./haptics"

interface PlayfabAuth {
    method: string
    payload: any
}

declare global {
    interface Window {
        // iOS
        isAppleApp: boolean
        webkit: {
            messageHandlers: { [key: string]: WebkitHandler }
        }

        // Android
        ModalAdPresenter?: {
            requestAd: (currentState: number) => void
            prepareAd: (currentState: number) => void
        }

        Analytics?: {
            event: (name: string, params: any) => void
            userProperty: (name: string, value: string) => void
            setId: (id: string) => void
        }

        Sharing?: {
            shareScreenshot: (name: string) => void
        }

        URLLoader?: {
            openURL: (url: string) => void
        }

        ga?(id: "send", event: "event", category: string, action: string, label: string, value?: number)
        playfabAuth?: PlayfabAuth | (() => PlayfabAuth)

        NotchOffset?: { offset: () => string | undefined }
    }
}

interface WebkitHandler {
    postMessage: (args: any) => void
}
