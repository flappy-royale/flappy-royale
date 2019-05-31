import * as constants from "../../constants"
import { BattleScene } from "../Scene"
import * as Phaser from "phaser"

export const preloadBusImages = (game: BattleScene) => {
    game.load.image("bus", require("../../../assets/battle/Bus.png"))
    game.load.image("bus-crashed", require("../../../assets/battle/BusCrashed.png"))

    game.load.image("trash-1", require("../../../assets/battle/trash-1.png"))
    game.load.image("trash-2", require("../../../assets/battle/trash-2.png"))
    game.load.image("trash-3", require("../../../assets/battle/trash-3.png"))
}

export const createBus = (scene: BattleScene) => {
    const bus = scene.physics.add.sprite(-10, 40, "bus")
    bus.setGravityY(-450)
    bus.setAccelerationX(20)
    bus.setDepth(constants.zLevels.birdWings + 1)
    return bus
}

export const busCrashed = (bus: Phaser.Physics.Arcade.Sprite, game: BattleScene) => {
    if (bus.getData("dead")) return

    bus.setAccelerationX(0)
    bus.setVelocityX(-65)
    bus.setGravityX(0)
    bus.setTexture("bus-crashed")
    bus.setGravityY(-300)
    bus.setData("dead", {})

    const trash1 = game.physics.add.image(bus.x + bus.width / 2 - 8, bus.y + 5, "trash-1")
    trash1.setVelocity(-70, -80)
    trash1.setDepth(constants.zLevels.birdWings + 2)

    const trash2 = game.physics.add.image(bus.x + bus.width / 2 - 8, bus.y + 5, "trash-2")
    trash2.setVelocity(-80, -70)
    trash2.setDepth(constants.zLevels.birdWings + 2)

    const trash3 = game.physics.add.image(bus.x + bus.width / 2 - 8, bus.y + 5, "trash-3")
    trash3.setVelocity(-60, -60)
    trash3.setDepth(constants.zLevels.birdWings + 2)
}
