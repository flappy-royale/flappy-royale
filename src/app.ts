import * as Phaser from "phaser";
import { GameScene } from "./GameScene"

const config: Phaser.Types.Core.GameConfig = {
  title: "Flappy",
  width: 800,
  height: 600,
  parent: "game",
  backgroundColor: "#18216D",
  scene: GameScene,
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },

};
export class FlappyGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game = new FlappyGame(config);
};
