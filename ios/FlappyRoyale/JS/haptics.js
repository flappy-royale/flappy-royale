window.haptics = {
  prepareLight: () => { prepare("light") },
  prepareMedium: () => { prepare("medium") },
  prepareHeavy: () => { prepare("heavy") },

  playLight: () => { play("light") },
  playMedium: () => { play("medium") },
  playHeavy: () => { play("heavy") }
}

function prepare(type) {
  window.webkit.messageHandlers.prepareHaptics.postMessage(type)
}

function play(type) {
  window.webkit.messageHandlers.playHaptics.postMessage(type)
}