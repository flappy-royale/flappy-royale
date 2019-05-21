import { PresentationAttire } from "./user/userManager"

// The gray bird itself
export const defaultAttire: PresentationAttire = {
    id: "default-body",
    description: "It flaps",
    fit: "tight",
    base: true,
    href: "assets/BirdBody.png"
}

export const builtInAttire: PresentationAttire[] = [
    defaultAttire,
    {
        id: "turtle-shell",
        description: "Flapping in a half-shell",
        fit: "tight",
        base: true,
        href: "assets/bases/Turtle.png"
    },
    {
        id: "flat-cap1",
        description: "A good old flat cap",
        fit: "loose",
        base: false,
        href: "assets/attire/FlatCap.png"
    },
    {
        id: "bad-beard",
        description: "A really dodgy beard",
        fit: "tight",
        base: false,
        href: "assets/attire/BadBeard.png"
    },
    {
        id: "crown1",
        description: "We can all be royale-ty",
        fit: "loose",
        base: false,
        href: "assets/attire/Crown1.png"
    }
]
