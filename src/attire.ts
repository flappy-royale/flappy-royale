import { PresentationAttire } from "./user/userManager"

// The gray bird itself
export const defaultAttire: PresentationAttire = {
    id: "default-body",
    description: "It flaps",
    fit: "tight",
    base: true,
    href: require("../assets/bases/BirdBody.png")
}

export const builtInAttire: PresentationAttire[] = [
    defaultAttire,
    {
        id: "turtle-shell",
        description: "Flapping in a half-shell",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Turtle.png")
    },
    {
        id: "bad-beard",
        description: "A really dodgy beard",
        fit: "tight",
        base: false,
        href: require("../assets/attire/BadBeard.png")
    },
    {
        id: "flat-cap1",
        description: "A good old flat cap",
        fit: "loose",
        base: false,
        href: require("../assets/attire/FlatCap.png")
    },
    {
        id: "crown1",
        description: "We can all be royale-ty",
        fit: "loose",
        base: false,
        href: require("../assets/attire/Crown1.png")
    }
]
