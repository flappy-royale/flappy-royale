import { BattleScene } from "./Scene"
import * as constants from "../constants"
import * as Phaser from "phaser"
import { createSprite } from "./utils/createSprite"

export const addRowOfPipes = (scene: BattleScene): Phaser.Physics.Arcade.Group => {
    // Randomly pick a number between 1 and 7
    // This will be the hole positioning
    const slots = 7

    // we have a height of 240 to work with ATM
    const windowHeight = 240
    // const windowHeight = scene.game.canvas.height

    // Distance from the top / bottom of the space
    const pipeEdgeBuffer = 170

    // Distance from the bottom
    const floorAvoidanceHeight = 40

    // get the distance between each potential interval
    const pipeIntervals = (windowHeight - pipeEdgeBuffer / 2 - constants.gapHeight / 2) / slots

    const holeSlot = Math.floor(scene.rng() * 5) + 1
    const holeTop = pipeIntervals * holeSlot + pipeEdgeBuffer / 2 - constants.gapHeight / 2 - floorAvoidanceHeight
    const holeBottom = pipeIntervals * holeSlot + pipeEdgeBuffer / 2 + constants.gapHeight / 2 - floorAvoidanceHeight

    const pipeTop = createSprite(180, holeTop, "pipe-top", scene)
    const pipeBottom = createSprite(180, holeBottom, "pipe-bottom", scene)

    const pipeTopBody = createSprite(180, holeTop - 5, "pipe-body", scene)
    pipeTopBody.setScale(1, 4000)

    const pipeBottomBody = createSprite(180, windowHeight, "pipe-body", scene)
    pipeBottomBody.setScale(1, windowHeight - holeBottom - 5)

    const pipes = [pipeTop, pipeTopBody, pipeBottom, pipeBottomBody]

    const group = new Phaser.Physics.Arcade.Group(scene.physics.world, scene, pipes, {})

    scene.sys.updateList.add(group as any)

    pipes.forEach(configurePipeSprite)

    return group
}

const configurePipeSprite = (pipe: Phaser.Physics.Arcade.Sprite) => {
    pipe.body.velocity.x = -1 * constants.pipeSpeed

    const body = pipe.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
}

export const pipeOutOfBoundsCheck = (pipes: Phaser.Physics.Arcade.Group[]) => {
    pipes.forEach(pipeGroup => {
        const obj = pipeGroup.getChildren()[0].body as Phaser.Physics.Arcade.Body
        if (obj.x < -60) {
            pipes.shift()
            pipeGroup.destroy()
        }
    })
}

export const preloadPipeSprites = (scene: Phaser.Scene) => {
    scene.load.image("pipe-top", "assets/PipeTop.png")
    scene.load.image("pipe-body", "assets/PipeLength.png")
    scene.load.image("pipe-bottom", "assets/PipeBottom.png")
}
