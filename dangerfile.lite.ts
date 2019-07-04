// import { fail } from "danger"
//
import { readFileSync } from "fs"
import { execSync, spawnSync } from "child_process"

const appTS = readFileSync("src/app.ts", "utf8")
if (!appTS.includes("const startupScreen = StartupScreen.MainMenu")) {
    throw "The app is not set up to launch into the Main Menu"
}

// Ensures we ship submodules
const subm = execSync("git submodule status", { encoding: "utf8" }).split(" ")
if (subm.length === 4) {
    const sha = subm[0]
    const check = spawnSync(`git --git-dir ./assets/.git --work-tree=./assets/ branch origin/master --contains ${sha}`)
    if (check.status) {
        throw "You need to push your assets to github"
    }
}
