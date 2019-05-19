import { BattleScene } from "./Scene"
import * as constants from "../constants"

// An invisible sprite with a physics body that covers the whole space
// for the pipe gaps, set devSettings.debugPhysics to true to see it
//
export const addScoreLine = (x: number, scene: BattleScene, sprite: any) => {
    const line = scene.physics.add.sprite(x, 160, "invis")
    const body = line.body as Phaser.Physics.Arcade.Body

    body.setSize(1, 300)
    body.velocity.x = -1 * constants.pipeSpeed
    body.setAllowGravity(false)

    return line
}
