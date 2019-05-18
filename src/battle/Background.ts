import { BattleScene } from "./Scene";


export const preloadBackgroundSprites = (scene: BattleScene) => {
  scene.load.image('ground', 'assets/ground.png');
}

export const createBackgroundSprites = (scene: BattleScene) => {
  scene.add.sprite(90, 220, "ground");
}


