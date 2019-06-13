
// Sometimes, race conditions mean that we try to add other game scenes to run the game while we're showing a loading screen
// wrapping all scene adds in this call make sure that won't happen
export function addScene(game: Phaser.Game, key: string, scene: Phaser.Scene, autostart?: boolean, data?: any) {
  if (game.scene.scenes.find(s => s.key === "LoadingScene")) { return }
  game.scene.add(key, scene, autostart, data)
}