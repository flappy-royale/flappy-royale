import * as constants from "../../constants"
import { BattleScene } from "../Scene"
import * as Phaser from "phaser"
import { TutorialScene } from "../TutorialScene";

export const preloadBusImages = (game: BattleScene | TutorialScene) => {
    game.load.image("bus", require("../../../assets/battle/Bus.png"))
    game.load.image("bus-crashed", require("../../../assets/battle/BusCrashed.png"))

    game.load.image("trash-1", require("../../../assets/battle/trash-1.png"))
    game.load.image("trash-2", require("../../../assets/battle/trash-2.png"))
    game.load.image("trash-3", require("../../../assets/battle/trash-3.png"))
}

export const createBus = (scene: BattleScene) => {
    const bus = scene.physics.add.sprite(-10, 40 + constants.GameAreaTopOffset, "bus")
    bus.setGravityY(-450)
    bus.setAccelerationX(20)
    bus.setDepth(constants.zLevels.birdWings + 1)
    return bus
}

export const busCrashed = (bus: Phaser.Physics.Arcade.Sprite, game: Phaser.Scene) => {
    if (bus.getData("dead")) return

    // Stop the bus, make it bounce back a bit
    bus.setAccelerationX(0)
    bus.setVelocityX(-65)
    bus.setGravityX(0)
    bus.setTexture("bus-crashed")
    bus.setGravityY(-300)
    bus.setData("dead", {})

    // Do some cute little trash bounces
    const trash1 = game.physics.add.image(bus.x + bus.width / 2 - 8, bus.y + 5, "trash-1")
    trash1.setVelocity(-70, -80)
    trash1.setDepth(constants.zLevels.birdWings + 2)

    const trash2 = game.physics.add.image(bus.x + bus.width / 2 - 8, bus.y + 5, "trash-2")
    trash2.setVelocity(-80, -70)
    trash2.setDepth(constants.zLevels.birdWings + 2)

    const trash3 = game.physics.add.image(bus.x + bus.width / 2 - 8, bus.y + 5, "trash-3")
    trash3.setVelocity(-60, -60)
    trash3.setDepth(constants.zLevels.birdWings + 2)

    const trash4 = game.physics.add.image(bus.x + bus.width / 2 - 8, bus.y + 5, "trash-3")
    trash4.setVelocity(-75, -60)
    trash4.setDepth(constants.zLevels.birdWings + 2)
    trash4.setAngle(90)

    const trash5 = game.physics.add.image(bus.x + bus.width / 2 - 8, bus.y + 5, "trash-2")
    trash5.setVelocity(-75, -50)
    trash5.setDepth(constants.zLevels.birdWings + 2)
    trash5.setAngle(180)

    // give them a hint of spin
    const trash1Body = trash1.body as Phaser.Physics.Arcade.Body
    trash1Body.setAngularVelocity(2)

    const trash2body = trash2.body as Phaser.Physics.Arcade.Body
    trash2body.setAngularVelocity(4)

    const trash3Body = trash3.body as Phaser.Physics.Arcade.Body
    trash3Body.setAngularVelocity(-6)
}
