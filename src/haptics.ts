export const haptics = {
  prepareLight: () => { prepare("light") },
  prepareMedium: () => { prepare("medium") },
  prepareHeavy: () => { prepare("heavy") },

  playLight: () => { play("light") },
  playMedium: () => { play("medium") },
  playHeavy: () => { play("heavy") },

  playSelection: () => { play("selection") },

  playSuccess: () => { play("success") },
  playError: () => { play("error") },
  playWarning: () => { play("warning") }
}

let prepare = (type: string) => { }
let play = (type: string) => {
  // While Apple's haptics give us nuanced vibrations, the web API just gives us ms times
  // TODO: These values are untested/untuned
  let map = {
    "light": 50,
    "medium": 100,
    "heavy": 150,

    "selection": 50,

    "success": 75,
    "error": 75,
    "warning": 75
  }

  if (navigator.vibrate) {
    navigator.vibrate(map[type] || 50)
  }
}

if (window.isAppleApp) {
  prepare = (type: string) => {
    window.webkit.messageHandlers.prepareHaptics.postMessage(type)
  }

  play = (type: string) => {
    window.webkit.messageHandlers.playHaptics.postMessage(type)
  }
}

