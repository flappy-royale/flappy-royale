// Careful now! Please don't import the game code into this module
// so that site's webpack run only imports our code

/** Things that are needed for showing stuff to a user */
export interface PresentationAttire extends Attire {
    /** A text description for the UI  */
    description: string
}

export interface Attire {
    /** Things that are needed for the game */
    fit: "loose" | "tight"
    /** The ID in the cache manager */
    id: string
    /** The url to the url */
    href: string
    /** Is this something that can be used as the base (e.g. represents the whole bird)  */
    base: boolean
}

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
        id: "banana",
        description: "It's a banana, kk",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Banana.png")
    },
    {
        id: "dog-1",
        description: "Woof woof",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Dog1.png")
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
    },
    {
        id: "baseball-1",
        description: "Going to a generic game",
        fit: "loose",
        base: false,
        href: require("../assets/attire/Baseball-Whiteblue.png")
    },
    {
        id: "bobble-1",
        description: "Keeping your noggin wawrm",
        fit: "loose",
        base: false,
        href: require("../assets/attire/BobbleHat.png")
    },
    {
        id: "sunnies-1",
        description: "Going to a generic game",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Sunnies.png")
    },
    {
        id: "tophat-1",
        description: "Going to a generic game",
        fit: "loose",
        base: false,
        href: require("../assets/attire/TopHat.png")
    },
    {
        id: "straw-1",
        description: "Going to a generic game",
        fit: "loose",
        base: false,
        href: require("../assets/attire/SummerHat.png")
    },
    {
        id: "mohawk-1",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Mohawk.png")
    },
    {
        id: "bandana1",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/bad-dana.png")
    },
    {
        id: "zen",
        description: "See no evil",
        fit: "tight",
        base: false,
        href: require("../assets/attire/zen.png")
    },
    {
        id: "nervous",
        description: ":|",
        fit: "tight",
        base: false,
        href: require("../assets/attire/nervous.png")
    },
    {
        id: "tired",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/tired.png")
    },
    {
        id: "paranoid",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Paranoid.png")
    },
    {
        id: "halo",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/halo.png")
    },
    {
        id: "big-mouth",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/bigmouth.png")
    },
    {
        id: "drool",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/drool.png")
    },
    {
        id: "tiny-eye",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Tiny_eyes.png")
    },
    {
        id: "ghost",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Ghost.png")
    },
    {
        id: "fantasy",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Fantasy.png")
    },
    {
        id: "sheep",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Sheep.png")
    },
    {
        id: "pug",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Pug.png")
    },
    {
        id: "robin",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Robin.png")
    },
    {
        id: "hedgehog",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Hedgehog.png")
    }
]

// One day these will be different
export const allAttire = builtInAttire
