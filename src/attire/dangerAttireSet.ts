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
            id: "fish",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Fish.png"),
            free: false
        },
        {
            id: "frog",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Frog.png"),
            free: false
        },
        {
            id: "whale",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Whale.png"),
            free: false
        },
        {
            id: "rabbit",
            description: "TBD",
            fit: "tight",
            base: true,
            href: require("../../assets/bases/Rabbit.png"),
            free: false
        },
        {
            id: "tie",
            description: "TBD",
            fit: "tight",
            base: false,
            href: require("../../assets/attire/Tie.png"),
            free: false
        }
    ]
}
