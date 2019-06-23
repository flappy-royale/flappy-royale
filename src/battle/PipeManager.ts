import { BattleScene } from "./Scene"
import * as constants from "../constants"
import * as Phaser from "phaser"
import { createSprite } from "./utils/createSprite"

import { themeMap, GameTheme } from "./theme"

export const addRowOfPipes = (x: number, scene: BattleScene, theme: GameTheme): Phaser.Physics.Arcade.Group => {
    const gapHeight = constants.gapHeight - Math.min(Math.floor(scene.score / 20), 6)
    const holeSlot = Math.floor(scene.rng() * 5) + 1

    return addRowOfPipesManual(x, scene, gapHeight, holeSlot, theme)
}

export const addRowOfPipesManual = (x: number, scene: Phaser.Scene, gapHeight: number, holeSlot: number, theme: GameTheme): Phaser.Physics.Arcade.Group => {
    const sprites = themeMap[theme]

    // Randomly pick a number between 1 and 7
    // This will be the hole positioning
    const slots = 7

    const windowHeight = constants.GameAreaHeight

    // Distance from the top / bottom of the space
    const pipeEdgeBuffer = 170

    // Distance from the bottom
    const floorAvoidanceHeight = 40


    // get the distance between each potential interval
    const pipeIntervals = (windowHeight - pipeEdgeBuffer / 2 - gapHeight / 2) / slots

    const holeTop = Math.round(
        pipeIntervals * holeSlot +
        pipeEdgeBuffer / 2 -
        gapHeight / 2 -
        floorAvoidanceHeight +
        constants.GameAreaTopOffset
    )
    const holeBottom = Math.round(
        pipeIntervals * holeSlot +
        pipeEdgeBuffer / 2 +
        gapHeight / 2 -
        floorAvoidanceHeight +
        constants.GameAreaTopOffset
    )

    const pipeTop = createSprite(x, holeTop, sprites.top[0], scene)
    const pipeBottom = createSprite(x, holeBottom, sprites.bottom[0], scene)

    const pipeTopBody = createSprite(x, holeTop - 5, sprites.body[0], scene)
    pipeTopBody.setScale(1, 4000)

    const pipeBottomBody = createSprite(x, windowHeight, sprites.body[0], scene)
    pipeBottomBody.setScale(1, windowHeight - holeBottom - 5)

    pipeTop.setDepth(constants.zLevels.pipe)
    pipeTopBody.setDepth(constants.zLevels.pipe)
    pipeBottom.setDepth(constants.zLevels.pipe)
    pipeBottomBody.setDepth(constants.zLevels.pipe)

    const pipes = [pipeTop, pipeTopBody, pipeBottom, pipeBottomBody]

    const group = scene.physics.add.group(pipes)
    group.setVelocityX(-1 * constants.pipeSpeed)
    pipes.forEach(configurePipeSprite)

    return group
}

const configurePipeSprite = (pipe: Phaser.Physics.Arcade.Sprite) => {
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

export const nudgePipesOntoPixelGrid = (pipes: Phaser.Physics.Arcade.Group[]) => {
    pipes.forEach(pipeGroup => {
        pipeGroup.getChildren().forEach(p => {
            const body = p.body as Phaser.Physics.Arcade.Body
            body.position.x = Math.floor(body.position.x)
        })
    })
}

export const preloadPipeSprites = (scene: Phaser.Scene, theme: GameTheme = GameTheme.default) => {
    const sprites = themeMap[theme]

    scene.load.image(sprites.top[0], sprites.top[1])
    scene.load.image(sprites.body[0], sprites.body[1])
    scene.load.image(sprites.bottom[0], sprites.bottom[1])
}
