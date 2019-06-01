// import { fail } from "danger"
//
import { readFileSync } from "fs"

const appTS = readFileSync("src/app.ts", "utf8")
if (!appTS.includes("const startupScreen = StartupScreen.MainMenu")) {
    throw "The app is not set up to launch into the Main Menu"
}
