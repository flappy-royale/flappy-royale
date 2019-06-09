// Ensures these get connected correctly
import "./site.css"
import "./index.html"

import { allAttire, PresentationAttire } from "../src/attire"

const shuffleAttires = () => {
    const bases = allAttire.filter(a => a.base)
    const hatsIsh = allAttire.filter(a => !a.base)

    const getRandomBird = () => {
        const base = bases[Math.floor(Math.random() * bases.length)]

        const amountOfItems = Math.floor(Math.random() * 3)
        const hatsToWear = hatsIsh.sort(() => 0.5 - Math.random()).slice(0, amountOfItems)
        return [base, ...hatsToWear]
    }

    const createBirdHTML = (attire: PresentationAttire[]) => {
        const root = document.createElement("li")
        const angle = Math.floor(Math.random() * 12) - 6
        root.style.transform = `rotate(${angle}deg) scale(4)`

        const div = document.createElement("div")
        const userBase = attire.find(a => a.base)
        const img = document.createElement("img")
        img.src = userBase.href
        img.className = "you-attire"

        div.appendChild(img)

        attire
            .filter(a => !a.base)
            .forEach(a => {
                const attireImg = document.createElement("img")
                attireImg.src = a.href
                attireImg.className = "you-attire"
                div.appendChild(attireImg)
            })

        const wings = document.createElement("img")
        wings.src = require("../assets/battle/flap-gif.gif")
        wings.className = "you-attire"
        div.appendChild(wings)

        root.appendChild(div)
        return root
    }

    const root = document.getElementById("stylish-flappers")
    while (root.hasChildNodes()) {
        root.removeChild(root.lastChild)
    }

    const indexes = [...Array(8).keys()]
    indexes.forEach(i => {
        const attire = getRandomBird()
        const bird = createBirdHTML(attire)
        root.append(bird)
    })
}

document.onreadystatechange = e => {
    shuffleAttires()
}
