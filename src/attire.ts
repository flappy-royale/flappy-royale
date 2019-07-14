// Careful now! Please don't import the game code into this module
// so that site's webpack run only imports our code

/** Things that are needed for showing stuff to a user */
export interface PresentationAttire extends Attire {
    name?: string
    description: string
    free: boolean
    /**
     * -1 = built in
     *  1 = s-tier
     *  2 = rare
     *  3 = common
     */
    tier: -1 | 1 | 2 | 3
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

export const hedgehog: PresentationAttire = {
    id: "hedgehog",
    description: "Whole hedgehog",
    fit: "tight",
    base: true,
    href: require("../assets/bases/default/Hedgehog.png"),
    free: true,
    tier: -1
}

export const dog: PresentationAttire = {
    id: "dog-1",
    description: "Woof woof",
    fit: "tight",
    base: true,
    href: require("../assets/bases/default/Dog1.png"),
    free: true,
    tier: -1
}

export const sheep: PresentationAttire = {
    id: "sheep",
    description: "Bird got punk'd",
    fit: "tight",
    base: true,
    href: require("../assets/bases/default/Sheep.png"),
    free: true,
    tier: -1
}

export const defaultAttire = hedgehog
