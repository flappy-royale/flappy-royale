import { BattleScene } from "./Scene";


export const preloadBackgroundSprites = (scene: BattleScene) => {
  scene.load.image('ground', 'assets/ground.png');
  scene.load.image('clouds', 'assets/clouds.png');
  scene.load.image('bushes', 'assets/bushes.png');
  scene.load.image('city', 'assets/city.png');
}

export const createBehindPipeBackgroundSprites = (scene: BattleScene) => {
  scene.add.sprite(80, 160, "clouds");
  scene.add.sprite(80, 160, "city");
  scene.add.sprite(80, 176, "bushes");
}


export const createAfterPipeBackgroundSprites = (scene: BattleScene) => {
  scene.add.sprite(80, 230, "ground");
}

