import { haptics } from "./haptics";

// TS seems unhappy if we try to extend Window in individual files,
// so all of our native app extensions should just go here :/
declare global {
  interface Window {
    haptics: typeof haptics
    isAppleApp: boolean
    webkit: {
      messageHandlers: { [key: string]: WebkitHandler }
    }
  }
}

interface WebkitHandler {
  postMessage: (args: any) => void
}