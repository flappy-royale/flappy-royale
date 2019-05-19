import { BattleScene } from "../Scene"

export const enablePhysicsLogging = (scene: BattleScene) => {
    scene.physics.world.createDebugGraphic()
    scene.physics.world.defaults.bodyDebugColor = 0x330044
    scene.physics.world.defaults.staticBodyDebugColor = 0x0000ff
    scene.physics.world.defaults.velocityDebugColor = 0x006600
    scene.physics.world.drawDebug = true
}
