import { haptics } from "./haptics"

declare global {
    interface Window {
        isAppleApp: boolean
        webkit: {
            messageHandlers: { [key: string]: WebkitHandler }
        }
    }
}

interface WebkitHandler {
    postMessage: (args: any) => void
}
