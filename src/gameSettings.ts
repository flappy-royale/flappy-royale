interface GameSettings {
    sound: boolean
    haptics: boolean
    darkMode: boolean
    autoDarkMode: boolean
}

const defaultSettings: GameSettings = {
    sound: true,
    haptics: true,
    darkMode: false,
    autoDarkMode: false
}

const LocalStorageKey = "GameSettings"

export const getSettings = (): GameSettings => {
    const stored = localStorage.getItem(LocalStorageKey)

    if (stored) {
        var settings = JSON.parse(stored)
    }

    return settings || defaultSettings
}

export const saveSettings = (settings: Partial<GameSettings>) => {
    const existing = getSettings()
    const newSettings = { ...existing, ...settings }
    localStorage.setItem(LocalStorageKey, JSON.stringify(newSettings))
}
