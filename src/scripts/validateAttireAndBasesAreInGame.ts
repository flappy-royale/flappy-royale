import { readFileSync, readdirSync } from "fs"
import { basename, join } from "path"

const bases = readdirSync("assets/bases", "utf8").map(p => `assets/bases/${p}`)
const attires = readdirSync("assets/attire", "utf8").map(p => `assets/attire/${p}`)
const check = bases.concat(attires)

const imgToJSON = (name: string, set: string, base: boolean) => {
    const id = name
        .toLowerCase()
        .replace(" ", "_")
        .replace(".png", "")
    return `
{
    id: "${basename(set)}-${id}",
    description: "TBD",
    fit: "tight",
    base: ${base ? "true" : "false"},
    href: require("../../${set}/${name}"),
    free: false,
tier: 3
}`
}

const checkFolder = (root: string, name: string) => {
    const images = readdirSync(root, "utf8").filter(p => p.endsWith(".png"))
    const file = readFileSync(join("src/attire", name), "utf8")

    const jsons = images.filter(i => !file.includes(i)).map(i => imgToJSON(i, root, root.includes("/bases/")))
    if (jsons.length) {
        console.log("---------------------------------------------------------------------------------------")
        console.log("---------------------------------------------------------------------------------------")
        console.log("---------------------------------------------------------------------------------------")
        console.log(name)
        console.log(jsons.join(","))
    }
}

// https://gist.github.com/nblackburn/875e6ff75bc8ce171c758bf75f304707
function camelToKebab(string: string) {
    return string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

function kebabToCamel(input: string) {
    return input.replace(/-([a-z])/g, g => g[1].toUpperCase())
}

check.forEach(c => {
    if (c.includes(".")) return
    if (c.includes("set-logos")) return

    const setFolder = kebabToCamel(basename(c)) + "AttireSet.ts"
    checkFolder(c, setFolder)
})
