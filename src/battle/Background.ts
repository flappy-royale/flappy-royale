import { BattleScene } from "./Scene"
import * as constants from "../constants"

export const preloadBackgroundSprites = (scene: BattleScene) => {
    scene.load.image("ground", require("../../assets/battle/ground.png"))
    scene.load.image("clouds", require("../../assets/battle/clouds.png"))
    scene.load.image("bushes", require("../../assets/battle/bushes.png"))
    scene.load.image("city", require("../../assets/battle/city.png"))
}

var clouds: Phaser.GameObjects.TileSprite,
    clouds2: Phaser.GameObjects.TileSprite,
    city: Phaser.GameObjects.TileSprite,
    city2: Phaser.GameObjects.TileSprite,
    bushes: Phaser.GameObjects.TileSprite,
    bushes2: Phaser.GameObjects.TileSprite,
    ground: Phaser.GameObjects.TileSprite

export const createBackgroundSprites = (scene: BattleScene) => {
    // 148 px wide
    clouds = scene.add.tileSprite(74, 164 + constants.GameAreaTopOffset, 164, 0, "clouds")
    clouds2 = scene.add.tileSprite(74 + 148, 164 + constants.GameAreaTopOffset, 160, 0, "clouds")
    // 114 px
    city = scene.add.tileSprite(57, 171 + constants.GameAreaTopOffset, 0, 0, "city")
    city2 = scene.add.tileSprite(57 + 114, 171 + constants.GameAreaTopOffset, 0, 0, "city")
    // 147 px
    bushes = scene.add.tileSprite(74, 176 + constants.GameAreaTopOffset, 0, 0, "bushes")
    bushes2 = scene.add.tileSprite(74 + 147, 176 + constants.GameAreaTopOffset, 0, 0, "bushes")

    ground = scene.add.tileSprite(80, 230 + constants.GameAreaTopOffset, 0, 0, "ground")
    ground.setDepth(constants.zLevels.ground)
}

export const bgUpdateTick = () => {
    //if (clouds) clouds.setTilePosition(clouds.tilePositionX + 0.005)
    //if (clouds2) clouds2.setTilePosition(clouds.tilePositionX + 0.005)

    if (city) city.setTilePosition(city.tilePositionX + 0.125)
    if (city2) city2.setTilePosition(city2.tilePositionX + 0.125)

    if (bushes) bushes.setTilePosition(bushes.tilePositionX + 0.5)
    if (bushes2) bushes2.setTilePosition(bushes2.tilePositionX + 0.5)

    if (ground) ground.setTilePosition(ground.tilePositionX + 1)
}
