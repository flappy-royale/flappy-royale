require.extensions[".png"] = function(_module, _filename) {}

import { allAttireInGame } from "../attire/attireSets"

allAttireInGame.forEach(attire => {
    const allAttireIDWithMatchingID = allAttireInGame.filter(a => a.uuid === attire.uuid)
    if (allAttireIDWithMatchingID.length > 1) {
        console.error("Found duped attire:", allAttireIDWithMatchingID)
        process.exitCode = 1
    }
})
