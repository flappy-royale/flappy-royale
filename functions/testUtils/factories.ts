import { Attire } from "../../src/attire"
import { UserSettings } from "../../src/user/userManager"
import { PlayerData } from "../../src/firebase"

// Loading the actual default attire requires resolving an image URL,
// which requires going through the main app's webpack config.
// Inlining this is easier.
export const AttireFactory = (props?: any): Attire => {
    return {
        id: "default-body",
        description: "It flaps",
        fit: "tight",
        base: true,
        href: "some URL",
        ...props
    }
}
export const UserFactory = (props?: any): UserSettings => {
    return {
        name: "A bitrd",
        aesthetics: { attire: [AttireFactory()] },
        royale: { seedIndex: -1 },
        ...props
    }
}

export const PlayerDataFactory = (props?: any, name?: string): PlayerData => {
    let user = name ? UserFactory({ name }) : UserFactory()

    // If we need real actions:
    // JSON.parse("[{\"action\":\"sync\",\"timestamp\":44,\"value\":31},{\"action\":\"sync\",\"timestamp\":450,\"value\":33},{\"action\":\"sync\",\"timestamp\":851,\"value\":36},{\"action\":\"sync\",\"timestamp\":1251,\"value\":40},{\"action\":\"sync\",\"timestamp\":1651,\"value\":46},{\"action\":\"flap\",\"timestamp\":1868},{\"action\":\"sync\",\"timestamp\":2051,\"value\":33},{\"action\":\"sync\",\"timestamp\":2452,\"value\":52},{\"action\":\"flap\",\"timestamp\":2718},{\"action\":\"sync\",\"timestamp\":2852,\"value\":90},{\"action\":\"sync\",\"timestamp\":3252,\"value\":98},{\"action\":\"flap\",\"timestamp\":3335},{\"action\":\"sync\",\"timestamp\":3652,\"value\":91},{\"action\":\"flap\",\"timestamp\":3986},{\"action\":\"sync\",\"timestamp\":4069,\"value\":111},{\"action\":\"sync\",\"timestamp\":4469,\"value\":110},{\"action\":\"flap\",\"timestamp\":4602},{\"action\":\"sync\",\"timestamp\":4869,\"value\":108},{\"action\":\"flap\",\"timestamp\":5170},{\"action\":\"sync\",\"timestamp\":5270,\"value\":115},{\"action\":\"sync\",\"timestamp\":5670,\"value\":117},{\"action\":\"flap\",\"timestamp\":5670},{\"action\":\"sync\",\"timestamp\":6087,\"value\":102},{\"action\":\"flap\",\"timestamp\":6287},{\"action\":\"sync\",\"timestamp\":6487,\"value\":106},{\"action\":\"flap\",\"timestamp\":6820},{\"action\":\"sync\",\"timestamp\":6887,\"value\":110},{\"action\":\"sync\",\"timestamp\":7287,\"value\":106},{\"action\":\"flap\",\"timestamp\":7337},{\"action\":\"flap\",\"timestamp\":7571},{\"action\":\"sync\",\"timestamp\":7693,\"value\":80},{\"action\":\"flap\",\"timestamp\":7988},{\"action\":\"sync\",\"timestamp\":8104,\"value\":65},{\"action\":\"died\",\"timestamp\":8204}]"),

    return {
        user,
        actions: [],
        timestamp: 1560043606083,
        score: 1,
        ...props
    }
}
