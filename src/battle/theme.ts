export enum GameTheme {
    default,
    night,
    cave
}

interface Theme {
    ground: [string, string]
    bushes: [string, string]
    city: [string, string]
    clouds: [string, string]
    top: [string, string]
    body: [string, string]
    bottom: [string, string]
    bgColor: number
}

/** We have to statically declare all assets for webpack, so this map ensures we don't do dynamic lookups */
export const themeMap: { [key: number]: Theme } = {
    [GameTheme.default]: {
        ground: ["default-ground", require("../../assets/battle/ground.png")],
        bushes: ["default-bushes", require("../../assets/battle/bushes.png")],
        city: ["default-city", require("../../assets/battle/city.png")],
        clouds: ["default-clouds", require("../../assets/battle/clouds.png")],
        top: ["default-pipe-top", require("../../assets/battle/PipeTop.png")],
        body: ["default-pipe-body", require("../../assets/battle/PipeLength.png")],
        bottom: ["default-pipe-bottom", require("../../assets/battle/PipeBottom.png")],
        bgColor: 0x62cbe0
    },
    [GameTheme.night]: {
        ground: ["night-ground", require("../../assets/battle/themes/night-mode/ground.png")],
        bushes: ["night-bushes", require("../../assets/battle/themes/night-mode/bushes.png")],
        city: ["night-city", require("../../assets/battle/themes/night-mode/city.png")],
        clouds: ["night-clouds", require("../../assets/battle/themes/night-mode/clouds.png")],
        top: ["night-pipe-top", require("../../assets/battle/themes/night-mode/pipetop.png")],
        body: ["night-pipe-body", require("../../assets/battle/themes/night-mode/pipelength.png")],
        bottom: ["night-pipe-bottom", require("../../assets/battle/themes/night-mode/pipebottom.png")],
        bgColor: 0x3a7986
    }
}
