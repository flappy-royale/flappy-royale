const f = require("node-fetch")
const meta = require("../../assets/scripts/meta.json")

var webhook = {
    name: "DeployBot",
    content: " New build of Flappy Royale deployed"
}

f(meta.discord, {
    method: "post",
    body: JSON.stringify(webhook),

    headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
    }
})
