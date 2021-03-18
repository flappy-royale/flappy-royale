import { BattleScene } from "../Scene"
import { getUserSettings } from "../../user/userManager"

export const setupDeveloperKeyboardShortcuts = (scene: BattleScene) => {
    // Press E to print the current event stream
    const logEvents = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    logEvents.on("up", () => console.log(JSON.stringify((scene as any).userInput, null, 4)))

    // Press K to clear the console
    const clearConsole = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)
    clearConsole.on("up", () => console.clear())

    // Press L to see your local storage (user settings + recorded events)
    const logLocalStorage = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)
    logLocalStorage.on("up", () => {
        console.log("User Settings", getUserSettings())
    })

    // Press A to randomly change your attire
    // const changeAttire = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    // changeAttire.on("up", () => {
    //     if (scene["bird"]) {
    //         // scene.changeAttireToRandom()
    //     }
    // })

    return {
        logEvents,
        clearConsole,
        logLocalStorage
    }
}
