export enum GameTheme {
    default,
    night,
    cave
}

interface Theme {
    bus: [string, string]
    busCrashed: [string, string]
    groundTop: [string, string]
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
        bus: ["default-bus", require("../../assets/battle/themes/default/Bus.png")],
        busCrashed: ["default-bus", require("../../assets/battle/themes/default/BusCrashed.png")],
        groundTop: ["default-ground-top", require("../../assets/battle/themes/default/ground-top.png")],
        ground: ["default-ground", require("../../assets/battle/themes/default/ground-tile.png")],
        bushes: ["default-bushes", require("../../assets/battle/themes/default/bushes.png")],
        city: ["default-city", require("../../assets/battle/themes/default/city.png")],
        clouds: ["default-clouds", require("../../assets/battle/themes/default/clouds.png")],
        top: ["default-pipe-top", require("../../assets/battle/themes/default/PipeTop.png")],
        body: ["default-pipe-body", require("../../assets/battle/themes/default/PipeLength.png")],
        bottom: ["default-pipe-bottom", require("../../assets/battle/themes/default/PipeBottom.png")],
        bgColor: 0x62cbe0
    },
    [GameTheme.night]: {
        bus: ["default-bus", require("../../assets/battle/themes/night-mode/Bus.png")],
        busCrashed: ["default-bus", require("../../assets/battle/themes/night-mode/BusCrashed.png")],
        groundTop: ["night-ground-top", require("../../assets/battle/themes/night-mode/ground-top.png")],
        ground: ["night-ground", require("../../assets/battle/themes/night-mode/ground-tile.png")],
        bushes: ["night-bushes", require("../../assets/battle/themes/night-mode/bushes.png")],
        city: ["night-city", require("../../assets/battle/themes/night-mode/city.png")],
        clouds: ["night-clouds", require("../../assets/battle/themes/night-mode/clouds.png")],
        top: ["night-pipe-top", require("../../assets/battle/themes/night-mode/pipetop.png")],
        body: ["night-pipe-body", require("../../assets/battle/themes/night-mode/pipelength.png")],
        bottom: ["night-pipe-bottom", require("../../assets/battle/themes/night-mode/pipebottom.png")],
        bgColor: 0x3a7986
    }
    // So people don't have to download it
    //
    // [GameTheme.cave]: {
    //     ground: ["cave-ground", require("../../assets/battle/themes/cave/ground.png")],
    //     bushes: ["cave-bushes", require("../../assets/battle/themes/cave/bushes.png")],
    //     city: ["cave-city", require("../../assets/battle/themes/cave/city.png")],
    //     clouds: ["cave-clouds", require("../../assets/battle/themes/cave/clouds.png")],
    //     top: ["cave-pipe-top", require("../../assets/battle/themes/cave/pipetop.png")],
    //     body: ["cave-pipe-body", require("../../assets/battle/themes/cave/pipelength.png")],
    //     bottom: ["cave-pipe-bottom", require("../../assets/battle/themes/cave/pipebottom.png")],
    //     bgColor: 0x311706
    // }
}
