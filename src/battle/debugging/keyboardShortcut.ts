import { BattleScene } from "../Scene"

export const setupDeveloperKeyboardShortcuts = (scene: BattleScene) => {
    // Press E to print the current event stream
    const logEvents = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    logEvents.on("up", () => console.log(JSON.stringify(scene.userInput, null, 4)))

    // Press K to clear the console
    const clearConsole = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)
    logEvents.on("up", () => console.clear())

    return {
        logEvents,
        clearConsole
    }
}
