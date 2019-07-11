import { PresentationAttire } from "../attire"
import { AttireSet } from "./attireSets"

export const hedgehog: PresentationAttire = {
    id: "hedgehog",
    description: "Whole hedgehog",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/default/Hedgehog.png"),
    free: true
}

export const dog: PresentationAttire = {
    id: "dog-1",
    description: "Woof woof",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/default/Dog1.png"),
    free: true
}

export const sheep: PresentationAttire = {
    id: "sheep",
    description: "Bird got punk'd",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/default/Sheep.png"),
    free: true
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
            id: "turtle-shell",
            description: "Flapping in a half-shell",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Turtle.png"),
            free: true
        },
        {
            id: "banana",
            description: "It's a banana or A COISS, kk",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Banana.png"),
            free: true
        },
        dog,
        {
            id: "default-body",
            description: "It flaps",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/BirdBody.png"),
            free: true
        },
        {
            id: "flat-cap1",
            description: "A good old flat cap",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/FlatCap.png"),
            free: true
        },
        {
            id: "crown1",
            description: "We can all be royale-ty",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/Crown1.png"),
            free: true
        },
        {
            id: "crown2",
            description: "We can all be royale-ty",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/Crown2.png"),
            free: true
        },
        {
            id: "baseball-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/Baseball-Whiteblue.png"),
            free: true
        },
        {
            id: "bobble-1",
            description: "Keeping your noggin wawrm",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/BobbleHat.png"),
            free: true
        },
        {
            id: "sunnies-1",
            description: "Going to a generic game",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Sunnies.png"),
            free: true
        },
        {
            id: "tophat-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/TopHat.png"),
            free: true
        },
        {
            id: "straw-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/default/SummerHat.png"),
            free: true
        },
        {
            id: "mohawk-1",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Mohawk.png"),
            free: true
        },
        {
            id: "bandana1",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/bad-dana.png"),
            free: true
        },
        {
            id: "zen",
            description: "See no evil",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/zen.png"),
            free: true
        },
        {
            id: "nervous",
            description: ":|",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/nervous.png"),
            free: true
        },
        {
            id: "nimbus",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Nimbus.png"),
            free: true
        },
        {
            id: "tired",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/tired.png"),
            free: true
        },
        {
            id: "paranoid",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Paranoid.png"),
            free: true
        },
        {
            id: "halo",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/halo.png"),
            free: true
        },
        {
            id: "big-mouth",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/bigmouth.png"),
            free: true
        },
        {
            id: "drool",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/drool.png"),
            free: true
        },
        {
            id: "tiny-eye",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Tiny_eyes.png"),
            free: true
        },
        {
            id: "ghost",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Ghost.png"),
            free: true
        },
        {
            id: "fantasy",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Fantasy.png"),
            free: true
        },
        {
            id: "sheep",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Sheep.png"),
            free: true
        },
        {
            id: "pug",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Pug.png"),
            free: true
        },
        {
            id: "robin",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Robin.png"),
            free: true
        },
        {
            id: "mallard-duck",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Duck.png"),
            free: true
        },
        {
            id: "white-rabbit",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/WhiteRabbit.png"),
            free: true
        },
        {
            id: "rocket",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/Rocket.png"),
            free: true
        },
        {
            id: "dm-fox",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/default/DMFox.png"),
            free: true
        },
        {
            id: "flag_trans",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Flag_Trans.png"),
            free: true
        },
        {
            id: "pride_hunter",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Pride_Hunter.png"),
            free: true
        },
        {
            id: "finish_flag",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/default/Finish_Flag.png"),
            free: true
        }
    ]
}
