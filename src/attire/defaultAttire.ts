import { PresentationAttire } from "../attire"
import { AttireSet } from "./attireSets"

export const hedgehog: PresentationAttire = {
    id: "hedgehog",
    description: "Whole hedgehog",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/Hedgehog.png"),
    free: true
}

export const dog: PresentationAttire = {
    id: "dog-1",
    description: "Woof woof",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/Dog1.png"),
    free: true
}

export const sheep: PresentationAttire = {
    id: "sheep",
    description: "Bird got punk'd",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/Sheep.png"),
    free: true
}

export const defaultAttireSet: AttireSet = {
    name: "Starter pack",
    id: "default",
    attributedTo: "Orta/Em/Zach",
    attributedURL: "https://flappyroyale.io",
    iconPath: require("../../assets/attire/set-logos/Default.png"),
    lightHexColor: "#E7D866",
    darkHexColor: "#8A7A00",
    attire: [
        hedgehog,
        {
            id: "turtle-shell",
            description: "Flapping in a half-shell",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Turtle.png"),
            free: true
        },
        {
            id: "banana",
            description: "It's a banana or A COISS, kk",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Banana.png"),
            free: true
        },
        dog,
        {
            id: "default-body",
            description: "It flaps",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/BirdBody.png"),
            free: true
        },
        {
            id: "flat-cap1",
            description: "A good old flat cap",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/FlatCap.png"),
            free: true
        },
        {
            id: "crown1",
            description: "We can all be royale-ty",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/Crown1.png"),
            free: true
        },
        {
            id: "crown2",
            description: "We can all be royale-ty",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/Crown2.png"),
            free: true
        },
        {
            id: "baseball-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/Baseball-Whiteblue.png"),
            free: true
        },
        {
            id: "bobble-1",
            description: "Keeping your noggin wawrm",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/BobbleHat.png"),
            free: true
        },
        {
            id: "sunnies-1",
            description: "Going to a generic game",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Sunnies.png"),
            free: true
        },
        {
            id: "tophat-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/TopHat.png"),
            free: true
        },
        {
            id: "straw-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/SummerHat.png"),
            free: true
        },
        {
            id: "mohawk-1",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Mohawk.png"),
            free: true
        },
        {
            id: "bandana1",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/bad-dana.png"),
            free: true
        },
        {
            id: "zen",
            description: "See no evil",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/zen.png"),
            free: true
        },
        {
            id: "nervous",
            description: ":|",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/nervous.png"),
            free: true
        },
        {
            id: "nimbus",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Nimbus.png"),
            free: true
        },
        {
            id: "tired",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/tired.png"),
            free: true
        },
        {
            id: "paranoid",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Paranoid.png"),
            free: true
        },
        {
            id: "halo",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/halo.png"),
            free: true
        },
        {
            id: "big-mouth",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/bigmouth.png"),
            free: true
        },
        {
            id: "drool",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/drool.png"),
            free: true
        },
        {
            id: "tiny-eye",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Tiny_eyes.png"),
            free: true
        },
        {
            id: "ghost",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Ghost.png"),
            free: true
        },
        {
            id: "fantasy",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Fantasy.png"),
            free: true
        },
        {
            id: "sheep",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Sheep.png"),
            free: true
        },
        {
            id: "pug",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Pug.png"),
            free: true
        },
        {
            id: "robin",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Robin.png"),
            free: true
        },
        {
            id: "mallard-duck",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Duck.png"),
            free: true
        },
        {
            id: "white-rabbit",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/WhiteRabbit.png"),
            free: true
        },
        {
            id: "rocket",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Rocket.png"),
            free: true
        },
        {
            id: "dm-fox",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/DMFox.png"),
            free: true
        },
        {
            id: "flag_trans",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Flag_Trans.png"),
            free: true
        },
        {
            id: "pride_hunter",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Pride_Hunter.png"),
            free: true
        },
        {
            id: "finish_flag",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Finish_Flag.png"),
            free: true
        }
    ]
}
