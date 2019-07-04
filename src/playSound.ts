import { getSettings } from "./gameSettings"

export function playSound(scene: Phaser.Scene, name: string) {
    if (getSettings().sound) {
        scene.sound.play(name)
    }
}
