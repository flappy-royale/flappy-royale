import * as Phaser from "phaser";
import { GameScene } from "./GameScene"
import { FirebaseDataStore } from "./firebase";

const config: Phaser.Types.Core.GameConfig = {
  title: "Flappy",
  width: 180,
  height: 240,
  parent: "game",
  backgroundColor: "#18216D",
  scene: GameScene,
  seed: ["consistent", "physics", "thanks"],
  scale: {
    // mode: Phaser.DOM
    mode: Phaser.Scale.ENVELOP,
    parent: 'game',
    // width: 160,
    // height: 240,
    zoom: Phaser.Scale.MAX_ZOOM

  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { 
        y: 300
      }
    }
  },
};

export class FlappyGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = async () => {
  const game = new FlappyGame(config);

  const firebase = new FirebaseDataStore("2")
  firebase.fetch().then(() => {
    (game.scene.getScene('GameScene') as GameScene).configureDataStore(firebase)
  })
};
