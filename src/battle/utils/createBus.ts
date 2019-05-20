import * as constants from "../../constants"
import { BattleScene } from "../Scene"
import * as Phaser from "phaser"

export const createBus = (scene: BattleScene) => {
    const bus = scene.physics.add.sprite(0, 40, "bus")
    bus.setGravityY(-450)
    bus.setAccelerationX(20)
    return bus
}

export const busCrashed = (bus: Phaser.Physics.Arcade.Sprite, _pipe: Phaser.Physics.Arcade.Sprite) => {
    bus.body.velocity.x = -1 * constants.pipeSpeed
    bus.setGravityY(-300)
}
