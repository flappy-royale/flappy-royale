import * as constants from "../../constants"
import { BattleScene } from "../Scene"
import * as Phaser from "phaser"

export const createBus = (scene: BattleScene) => {
    const bus = scene.physics.add.sprite(constants.birdXPosition, constants.birdYPosition, "bus")
    if ("setAllowGravity" in bus.body) {
        bus.body.setAllowGravity(false)
    }
    return bus
}

export const busCrashed = (bus: Phaser.Physics.Arcade.Sprite, _pipe: Phaser.Physics.Arcade.Sprite) => {
    bus.body.velocity.x = -1 * constants.pipeSpeed
    if ("setAllowGravity" in bus.body) {
        bus.body.setAllowGravity(true)
    }
}
