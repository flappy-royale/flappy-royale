const { readdirSync, readFileSync } = require("fs")
const { join } = require("path")

var MarkdownIt = require("markdown-it")
const md = new MarkdownIt()

const postPaths = readdirSync(join(__dirname, "blog"), "utf8")
    .map(p => `${__dirname}/blog/${p}`)
    .reverse()
const posts = postPaths.map(p => readFileSync(p, "utf8")).map(content => md.render(content))

module.exports = {
    locals: {
        hello: "world",
        posts: posts
    }
}
