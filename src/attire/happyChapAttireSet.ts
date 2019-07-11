import { AttireSet } from "./attireSets"

export const happyChapAttireSet: AttireSet = {
    name: "Chappo Packo",
    id: "happy-chap-pack",
    attributedTo: "The Happy Chappo",
    attributedURL: "https://www.facebook.com/thehappychappo/",
    iconPath: require("../../assets/attire/set-logos/HappyChappo.png"),
    lightHexColor: "#D49DBA",
    darkHexColor: "#994974",
    attire: [
        {
            id: "big-beak",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Big_Beak.png"),
            free: false
        },
        {
            id: "cthulu-bird",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Cthulu_Bird.png"),
            free: false
        },
        {
            id: "bluechog",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/BlueChog.png"),
            free: false
        },

        {
            id: "war-spoon",
            description: "TBD",
            fit: "loose",
            base: false,
            href: require("../../assets/attire/War_Spoon.png"),
            free: false
        }
    ]
}
