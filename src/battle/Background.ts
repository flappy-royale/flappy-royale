import { BattleScene } from "./Scene"

export const preloadBackgroundSprites = (scene: BattleScene) => {
    scene.load.image("ground", "assets/ground.png")
    scene.load.image("clouds", "assets/clouds.png")
    scene.load.image("bushes", "assets/bushes.png")
    scene.load.image("city", "assets/city.png")
}

var clouds: Phaser.GameObjects.TileSprite,
    clouds2: Phaser.GameObjects.TileSprite,
    city: Phaser.GameObjects.TileSprite,
    city2: Phaser.GameObjects.TileSprite,
    bushes: Phaser.GameObjects.TileSprite,
    bushes2: Phaser.GameObjects.TileSprite,
    ground: Phaser.GameObjects.Sprite

export const createBackgroundSprites = (scene: BattleScene) => {
    // 148 px wide
    clouds = scene.add.tileSprite(74, 164, 164, 0, "clouds")
    clouds2 = scene.add.tileSprite(74 + 148, 164, 160, 0, "clouds")
    // 114 px
    city = scene.add.tileSprite(57, 171, 0, 0, "city")
    city2 = scene.add.tileSprite(57 + 114, 171, 0, 0, "city")
    // 147 px
    bushes = scene.add.tileSprite(74, 176, 0, 0, "bushes")
    bushes2 = scene.add.tileSprite(74 + 147, 176, 0, 0, "bushes")

    ground = scene.add.sprite(80, 230, "ground")
}

export const bgUpdateTick = () => {
    if (clouds) clouds.setTilePosition(clouds.tilePositionX + 0.01)
    if (clouds2) clouds2.setTilePosition(clouds.tilePositionX + 0.01)

    if (city) city.setTilePosition(city.tilePositionX + 0.04)
    if (city2) city2.setTilePosition(city2.tilePositionX + 0.04)

    if (bushes) bushes.setTilePosition(bushes.tilePositionX + 0.08)
    if (bushes2) bushes2.setTilePosition(bushes2.tilePositionX + 0.08)

    // Makes sure the ground is always at the front, this will be an issue for deaths
    ground.setDepth(1)
}
