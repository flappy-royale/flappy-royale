import { LootboxTier } from "../functions/src/LootboxTier"

export const allLootBoxTiers = [0, 1, 2, 3] as const

/** Things that are needed for showing stuff to a user */
export interface PresentationAttire extends Attire {
    /** This is shown when you acquire the egg  */
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
    uuid: number
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
    tier: -1,
    uuid: 1
}

export const dog: PresentationAttire = {
    id: "dog-1",
    name: "Dog",
    description: "Woof woof",
    fit: "tight",
    base: true,
    href: require("../assets/bases/default/Dog1.png"),
    free: true,
    tier: -1,
    uuid: 2
}

export const sheep: PresentationAttire = {
    name: "Sheepo",
    id: "sheep",
    description: "Bird got punk'd",
    fit: "tight",
    base: true,
    href: require("../assets/bases/default/Sheep.png"),
    free: true,
    tier: -1,
    uuid: 3
}

export const defaultAttire = hedgehog
