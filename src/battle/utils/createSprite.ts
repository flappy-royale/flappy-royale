export const createSprite = (
    x: number,
    y: number,
    key: string,
    scene: Phaser.Scene,
    SpriteClass: any | Class = Phaser.Physics.Arcade.Sprite
): Phaser.Physics.Arcade.Sprite => {
    // This is why we have this method at all
    const sprite = new SpriteClass(scene, x, y, key)

    /// These come directly from: https://github.com/photonstorm/phaser/blob/v3.17.0/src/physics/arcade/Factory.js#L191-L214
    scene.sys.displayList.add(sprite)
    scene.sys.updateList.add(sprite)

    scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    return sprite
}
