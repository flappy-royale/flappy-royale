import { defaultAttire, Attire } from "../src/attire"
import { defaultAttireSet } from "../src/attire/defaultAttireSet"

const showDemo = () => {
    const intro = document.getElementById("intro")!
    intro.style.display = "none"

    const iframe = document.createElement("iframe")
    iframe.width = "660"
    iframe.height = "800"
    iframe.src = "https://flappyroyale.io/demo-web"
    iframe.frameBorder = "0"

    const wrapper = document.getElementById("underground")!.firstChild!
    wrapper.insertBefore(iframe, wrapper.firstChild)

    iframe.scrollIntoView({ behavior: "smooth" })

    if ("adsbygoogle" in window === false) {
        setupAdsense()
    }
}

const setupAdsense = () => {
    const script = document.createElement("script")
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    script.async = true
    script.onload = () => {
        //@ts-ignore
        ;(adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-5844650361408353",
            enable_page_level_ads: true
        })
    }
    document.getElementsByTagName("head")[0].appendChild(script)
}

// @ts-ignore
window.showDemo = showDemo

const addSomeButtsToThoseSeats = () => {
    // If you're showing the demo
    if (!document.getElementById("intro")) return
    if (document.getElementById("intro")!.style.display === "none") return

    const bases = defaultAttireSet.attire.filter(a => a.base)
    const hatsIsh = defaultAttireSet.attire.filter(a => !a.base)

    const getRandomBird = () => {
        const base = bases[Math.floor(Math.random() * bases.length)]

        const amountOfItems = Math.floor(Math.random() * 3)
        const hatsToWear = hatsIsh.sort(() => 0.5 - Math.random()).slice(0, amountOfItems)
        return [base, ...hatsToWear]
    }

    const createBirdHTML = (attire: Attire[]) => {
        const root = document.createElement("div")
        const angle = Math.floor(Math.random() * 12) - 6
        root.style.transform = `rotate(${angle}deg) scale(3.6) `

        const div = document.createElement("div")
        const userBase = attire.find(a => a.base)
        const img = document.createElement("img")
        img.src = userBase ? userBase.href : defaultAttire.href
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
            seatRow.removeChild(seatRow.lastChild!)
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

    if (document.location.href.includes("demo")) {
        showDemo()
    }

    window.addEventListener("hashchange", () => {
        if (document.location.href.includes("demo")) {
            showDemo()
        }
    })

    setInterval(() => {
        addSomeButtsToThoseSeats()
    }, 10000)
}
