// So we can import the attire data-models
require.extensions[".png"] = function(_module, _filename) {}

// Updates a TS file in the functions file to keep track of the attire on the server

import { allAttireInGame } from "../attire/attireSets"
import { writeFileSync } from "fs"
import { join } from "path"

const idToUUID = {} as any
allAttireInGame.forEach(attire => {
    idToUUID[attire.id] = attire.uuid
})

const jsonPath = join(__dirname, "../../functions/src/attireIDToUUID.derived.ts")
writeFileSync(jsonPath, `export const attireIDToUUIDMap: any = ${JSON.stringify(idToUUID)}`)
console.log("Updated attireIDToUUID.derived.ts")
