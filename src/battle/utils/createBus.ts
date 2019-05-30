import * as constants from "../../constants"
import { BattleScene } from "../Scene"
import * as Phaser from "phaser"

export const createBus = (scene: BattleScene) => {
    const bus = scene.physics.add.sprite(-10, 40, "bus")
    bus.setGravityY(-450)
    bus.setAccelerationX(20)
    bus.setDepth(constants.zLevels.birdWings + 1)
    return bus
}

export const busCrashed = (bus: Phaser.Physics.Arcade.Sprite) => {
    bus.body.velocity.x = -1 * constants.pipeSpeed
    bus.setTexture("bus-crashed")
    bus.setGravityY(-300)
}
