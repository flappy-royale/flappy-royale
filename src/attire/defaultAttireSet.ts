import { PresentationAttire } from "../attire"
import { AttireSet } from "./attireSets"

export const hedgehog: PresentationAttire = {
    name: "Chog",
    id: "hedgehog",
    description: "Whole hedgehog",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/default/Hedgehog.png"),
    free: true,
    tier: -1
}

export const dog: PresentationAttire = {
    name: "Dog",
    id: "dog-1",
    description: "Woof woof",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/default/Dog1.png"),
    free: true,
    tier: -1
}

export const sheep: PresentationAttire = {
    name: "Sheep",
    id: "sheep",
    description: "Bird got punk'd",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/default/Sheep.png"),
    free: true,
    tier: -1
}

export const defaultAttireSet: AttireSet = {
    name: "Starter pack",
    id: "default",
    attributedTo: "Orta/Em/Zach",
    attributedURL: "https://flappyroyale.io/media.html",
    iconPath: require("../../assets/attire/set-logos/Default.png"),
    lightHexColor: "#E7D866",
    darkHexColor: "#8A7A00",
    attire: [
        hedgehog,
        {
            name: "n/a",
            id: "turtle-shell",
            description: "Flapping in a half-shell",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Turtle.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "banana",
            description: "It's a banana or A COISS, kk",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Banana.png"),
            free: true,
            tier: -1
        },
        dog,
        {
            name: "n/a",
            id: "default-body",
            description: "It flaps",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/BirdBody.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "flat-cap1",
            description: "A good old flat cap",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/FlatCap.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "crown1",
            description: "We can all be royale-ty",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/Crown1.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "crown2",
            description: "We can all be royale-ty",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/Crown2.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "baseball-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/Baseball-Whiteblue.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "bobble-1",
            description: "Keeping your noggin wawrm",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/BobbleHat.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "sunnies-1",
            description: "Going to a generic game",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Sunnies.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "tophat-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/TopHat.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",

            id: "straw-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/SummerHat.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "mohawk-1",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Mohawk.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "bandana1",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/bad-dana.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "zen",
            description: "See no evil",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/zen.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "nervous",
            description: ":|",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/nervous.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "nimbus",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Nimbus.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "tired",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/tired.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "paranoid",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Paranoid.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "halo",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/halo.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "big-mouth",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/bigmouth.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "drool",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/drool.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "tiny-eye",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Tiny_eyes.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "ghost",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Ghost.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "fantasy",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Fantasy.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "sheep",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Sheep.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "pug",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Pug.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "robin",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Robin.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "mallard-duck",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Duck.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "white-rabbit",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/WhiteRabbit.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "rocket",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Rocket.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "dm-fox",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/DMFox.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "flag_trans",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Flag_Trans.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "pride_hunter",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Pride_Hunter.png"),
            free: true,
            tier: -1
        },
        {
            name: "n/a",
            id: "finish_flag",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Finish_Flag.png"),
            free: true,
            tier: -1
        }
    ]
}
