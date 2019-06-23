// Ensures these get connected correctly
import "./site.css"

//  Lol, this is how you make sure a file is in the site
import "./index.html"
import "./privacy.html"
import "./media.html"

import { allAttire, PresentationAttire } from "../src/attire"

const addSomeButtsToThoseSeats = () => {
    const bases = allAttire.filter(a => a.base)
    const hatsIsh = allAttire.filter(a => !a.base)

    const getRandomBird = () => {
        const base = bases[Math.floor(Math.random() * bases.length)]

        const amountOfItems = Math.floor(Math.random() * 3)
        const hatsToWear = hatsIsh.sort(() => 0.5 - Math.random()).slice(0, amountOfItems)
        return [base, ...hatsToWear]
    }

    const createBirdHTML = (attire: PresentationAttire[]) => {
        const root = document.createElement("div")
        const angle = Math.floor(Math.random() * 12) - 6
        root.style.transform = `rotate(${angle}deg) scale(3.6) `

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

    const seats = document.getElementsByClassName("seats")
    for (const seatRow of seats) {
        while (seatRow.hasChildNodes()) {
            seatRow.removeChild(seatRow.lastChild)
        }

        const indexes = [...Array(4).keys()]
        indexes.forEach(i => {
            const li = document.createElement("li")
            const attire = getRandomBird()
            const bird = createBirdHTML(attire)
            li.append(bird)

            const seatPic = document.createElement("img")
            seatPic.src = require("./assets/chair.png")
            seatPic.style.left = "10px"

            li.append(seatPic)
            seatRow.append(li)
        })
    }
}

document.onreadystatechange = e => {
    addSomeButtsToThoseSeats()
    setInterval(() => {
        addSomeButtsToThoseSeats()
    }, 10000)
}
