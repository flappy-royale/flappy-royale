import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs"
import { execSync } from "child_process"

// The Settings HTML path will be a SHA filename, so we need to loop through all of the HTML files in both
// /prod and /demo to ensure they switch.
const sha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim()
;["prod", "demo-web"].forEach(environment => {
    const dir = readdirSync(`dist/${environment}`, { encoding: "utf8" })
    const htmlFiles = dir.filter(f => f.endsWith("html"))
    htmlFiles.forEach(htmlFile => {
        const htmlPath = `dist/${environment}/${htmlFile}`
        const content = readFileSync(htmlPath, { encoding: "utf8" })
        if (content.includes("###SHA")) {
            console.log(`Stamping SHA (${sha}) into ${htmlPath}`)
            writeFileSync(htmlPath, content.replace("###SHA", sha), { encoding: "utf8" })
        }
    })
})

mkdirSync("dist/demo")
writeFileSync("dist/demo/index.html", '<meta http-equiv="refresh" content="0; url=/#show-demo" />', "utf8")
