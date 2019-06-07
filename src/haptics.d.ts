declare interface Window {
  haptics?: Haptics
}

interface Haptics {
  prepareLight: () => void,
  prepareMedium: () => void,
  prepareHeavy: () => void,

  playLight: () => void,
  playMedium: () => void,
  playHeavy: () => void,

  playSelection: () => void

  playSuccess: () => void
  playError: () => void
  playWarning: () => void
}
