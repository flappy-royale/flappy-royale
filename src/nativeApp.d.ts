import { haptics } from "./haptics"

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
        }
    }
}

interface WebkitHandler {
    postMessage: (args: any) => void
}
