import { AttireSet } from "./attireSets"

export const dangerAttireSet: AttireSet = {
    name: "Cute Animals",
    id: "danger",
    attributedTo: "Danger",
    attributedURL: "https://www.instagram.com/gemmamcshane/",
    iconPath: require("../../assets/attire/set-logos/Danger.png"),
    lightHexColor: "#ACD49D",
    darkHexColor: "#547846",
    attire: [
        {
            id: "danger-fish",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/danger/Fish.png"),
            free: false
        },
        {
            id: "danger-frog",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/danger/Frog.png"),
            free: false
        },
        {
            id: "danger-whale",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/danger/Whale.png"),
            free: false
        },
        {
            id: "danger-pug",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/danger/Pig.png"),
            free: false
        },
        {
            id: "danger-tie",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/danger/Tie.png"),
            free: false
        },
        {
            id: "danger-horse",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/danger/horse.png"),
            free: false
        }
    ]
}
