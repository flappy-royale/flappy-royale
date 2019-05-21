import { BattleScene } from "../Scene"
import { getUserSettings, getRoyales, changeSettings } from "../../user/userManager"
import { builtInAttire } from "../../attire"

export const setupDeveloperKeyboardShortcuts = (scene: BattleScene) => {
    // Press E to print the current event stream
    const logEvents = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    logEvents.on("up", () => console.log(JSON.stringify(scene.userInput, null, 4)))

    // Press K to clear the console
    const clearConsole = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)
    clearConsole.on("up", () => console.clear())

    // Press L to see your local storage (user settings + recorded events)
    const logLocalStorage = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)
    logLocalStorage.on("up", () => {
        console.log("User Settings", getUserSettings())
        console.log("Royale Scores")
        console.table(getRoyales())
    })

    // Press A to randomly change your attire
    const changeAttire = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    changeAttire.on("up", () => {
        const bases = builtInAttire.filter(a => a.base)
        const base = bases[Math.floor(Math.random() * bases.length)]

        const hatsIsh = builtInAttire.filter(a => !a.base)
        const amountOfItems = Math.floor(Math.random() * bases.length)
        const hatsToWear = hatsIsh.sort(() => 0.5 - Math.random()).slice(0, amountOfItems)

        changeSettings({ aesthetics: { attire: [base, ...hatsToWear] } })
        const gotHats = hatsToWear.length

        console.group("Changing Attire")
        console.log("To base:")

        console.table([base])

        if (gotHats) {
            console.log("With:")
            console.table(hatsToWear)
        }
        console.groupEnd()
    })

    return {
        logEvents,
        clearConsole,
        logLocalStorage
    }
}
