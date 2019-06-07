declare interface Window {
  haptics?: Haptics
}

interface Haptics {
  prepareLight: () => void,
  prepareMedium: () => void,
  prepareHeavy: () => void,

  playLight: () => void,
  playMedium: () => void,
  playHeavy: () => void
}
