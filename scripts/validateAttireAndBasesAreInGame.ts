import { readFileSync, readdirSync } from "fs"

const attireTS = readFileSync("src/attire.ts", "utf8")

const bases = readdirSync("assets/bases", "utf8")
const attires = readdirSync("assets/attire", "utf8")
const check = bases.concat(attires)
const needed: string[] = []

check.forEach(att => {
    if (!att.endsWith(".png")) return
    if (!attireTS.includes(att)) needed.push(att)
})

const toJSON = needed.map(att => {
    const id = att
        .toLowerCase()
        .replace(" ", "_")
        .replace(".png", "")
    return `
{
    id: "${id}",
    description: "TBD",
    fit: "tight",
    base: ${bases.includes(att) ? "true" : "false"},
    href: require("../assets/${bases.includes(att) ? "bases" : "attire"}/${att}")
}`
})

console.log(toJSON.join())
console.log(`Got ${needed.length} missing`)
