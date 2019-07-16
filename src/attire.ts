// Careful now! Please don't import the game code into this module
// so that site's webpack run only imports our code

export type LootboxTier = -1 | 0 | 1 | 2 | 3
export const allLootBoxTiers = [0, 1, 2, 3] as const

/** Things that are needed for showing stuff to a user */
export interface PresentationAttire extends Attire {
    name: string
    description: string
    free: boolean
    /**
     * -1 = built in
     *  0 = s-tier
     *  1 = rare
     *  2 = common
     *  3 = everywhere
     */
    tier: LootboxTier
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
    name: "Chog",
    description: "Whole hedgehog",
    fit: "tight",
    base: true,
    href: require("../assets/bases/default/Hedgehog.png"),
    free: true,
    tier: -1
}

export const dog: PresentationAttire = {
    id: "dog-1",
    name: "Dog",
    description: "Woof woof",
    fit: "tight",
    base: true,
    href: require("../assets/bases/default/Dog1.png"),
    free: true,
    tier: -1
}

export const sheep: PresentationAttire = {
    name: "Sheepo",
    id: "sheep",
    description: "Bird got punk'd",
    fit: "tight",
    base: true,
    href: require("../assets/bases/default/Sheep.png"),
    free: true,
    tier: -1
}

export const defaultAttire = hedgehog
