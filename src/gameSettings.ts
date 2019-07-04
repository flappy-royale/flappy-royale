interface GameSettings {
    sound: boolean
    haptics: boolean
}

const defaultSettings: GameSettings = {
    sound: true,
    haptics: true
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
