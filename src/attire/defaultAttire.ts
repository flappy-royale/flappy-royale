import { PresentationAttire } from "../attire"
import { AttireSet } from "./attireSets"

export const hedgehog: PresentationAttire = {
    id: "hedgehog",
    description: "Whole hedgehog",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/Hedgehog.png")
}

export const dog: PresentationAttire = {
    id: "dog-1",
    description: "Woof woof",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/Dog1.png")
}

export const sheep: PresentationAttire = {
    id: "sheep",
    description: "Bird got punk'd",
    fit: "tight",
    base: true,
    href: require("../../assets/bases/Sheep.png")
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
            href: require("../../assets/bases/Turtle.png")
        },
        {
            id: "banana",
            description: "It's a banana or A COISS, kk",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Banana.png")
        },
        dog,
        {
            id: "default-body",
            description: "It flaps",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/BirdBody.png")
        },
        {
            id: "flat-cap1",
            description: "A good old flat cap",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/FlatCap.png")
        },
        {
            id: "crown1",
            description: "We can all be royale-ty",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/Crown1.png")
        },
        {
            id: "crown2",
            description: "We can all be royale-ty",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/Crown2.png")
        },
        {
            id: "baseball-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/Baseball-Whiteblue.png")
        },
        {
            id: "bobble-1",
            description: "Keeping your noggin wawrm",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/BobbleHat.png")
        },
        {
            id: "sunnies-1",
            description: "Going to a generic game",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Sunnies.png")
        },
        {
            id: "tophat-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/TopHat.png")
        },
        {
            id: "straw-1",
            description: "Going to a generic game",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/SummerHat.png")
        },
        {
            id: "mohawk-1",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Mohawk.png")
        },
        {
            id: "bandana1",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/bad-dana.png")
        },
        {
            id: "zen",
            description: "See no evil",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/zen.png")
        },
        {
            id: "nervous",
            description: ":|",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/nervous.png")
        },
        {
            id: "nimbus",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Nimbus.png")
        },
        {
            id: "tired",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/tired.png")
        },
        {
            id: "paranoid",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Paranoid.png")
        },
        {
            id: "halo",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/halo.png")
        },
        {
            id: "big-mouth",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/bigmouth.png")
        },
        {
            id: "drool",
            description: "Bird got punk'd",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/drool.png")
        },
        {
            id: "tiny-eye",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Tiny_eyes.png")
        },
        {
            id: "ghost",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Ghost.png")
        },
        {
            id: "fantasy",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Fantasy.png")
        },
        {
            id: "sheep",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Sheep.png")
        },
        {
            id: "pug",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Pug.png")
        },
        {
            id: "robin",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Robin.png")
        },
        {
            id: "mallard-duck",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Duck.png")
        },
        {
            id: "white-rabbit",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/WhiteRabbit.png")
        },
        {
            id: "rocket",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Rocket.png")
        },
        {
            id: "dm-fox",
            description: "Bird got punk'd",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/DMFox.png")
        },
        {
            id: "flag_trans",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Flag_Trans.png")
        },
        {
            id: "pride_hunter",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Pride_Hunter.png")
        },
        {
            id: "finish_flag",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Finish_Flag.png")
        }
    ]
}
