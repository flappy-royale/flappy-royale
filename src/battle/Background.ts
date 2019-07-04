import { BattleScene } from "./Scene"
import * as constants from "../constants"
import { themeMap, GameTheme } from "./theme"
import { TutorialScene } from "./TutorialScene"

export const preloadBackgroundSprites = (scene: Phaser.Scene, theme: GameTheme = GameTheme.default) => {
    const bg = themeMap[theme]
    scene.load.image(bg.ground[0], bg.ground[1])
    scene.load.image(bg.bushes[0], bg.bushes[1])
    scene.load.image(bg.city[0], bg.city[1])
    scene.load.image(bg.clouds[0], bg.clouds[1])
}

var city: Phaser.GameObjects.TileSprite,
    city2: Phaser.GameObjects.TileSprite,
    bushes: Phaser.GameObjects.TileSprite,
    bushes2: Phaser.GameObjects.TileSprite,
    ground: Phaser.GameObjects.TileSprite

export const createBackgroundSprites = (scene: BattleScene | TutorialScene, theme: GameTheme) => {
    const bg = themeMap[theme]

    // 148 px wide
    scene.add.tileSprite(74, 166 + constants.GameAreaTopOffset, 164, 0, bg.clouds[0])
    scene.add.tileSprite(74 + 147, 166 + constants.GameAreaTopOffset, 160, 0, bg.clouds[0])
    // 114 px
    city = scene.add.tileSprite(57, 173 + constants.GameAreaTopOffset, 0, 0, bg.city[0])
    city2 = scene.add.tileSprite(57 + 114, 173 + constants.GameAreaTopOffset, 0, 0, bg.city[0])
    // 147 px
    bushes = scene.add.tileSprite(74, 178 + constants.GameAreaTopOffset, 0, 0, bg.bushes[0])
    bushes2 = scene.add.tileSprite(74 + 147, 178 + constants.GameAreaTopOffset, 0, 0, bg.bushes[0])

    ground = scene.add.tileSprite(80, 232 + constants.GameAreaTopOffset, 0, 0, bg.ground[0])
    ground.setDepth(constants.zLevels.ground)
}

export const bgUpdateTick = () => {
    if (city) city.setTilePosition(city.tilePositionX + 0.125)
    if (city2) city2.setTilePosition(city2.tilePositionX + 0.125)

    if (bushes) bushes.setTilePosition(bushes.tilePositionX + 0.5)
    if (bushes2) bushes2.setTilePosition(bushes2.tilePositionX + 0.5)

    if (ground) ground.setTilePosition(ground.tilePositionX + 1)
}
