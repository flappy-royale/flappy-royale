import * as Phaser from "phaser";
import { BattleScene } from "./battle/Scene";
import { FirebaseDataStore } from "./firebase";
import * as constants from "./constants";

const config: Phaser.Types.Core.GameConfig = {
    title: "Flappy",
    width: 160,
    height: 240,
    parent: "game",
    backgroundColor: "#62CBE0",
    scene: BattleScene,
    seed: ["consistent", "physics", "thanks"],
    scale: {
        // mode: Phaser.DOM
        mode: Phaser.Scale.FIT,
        parent: "game",
        width: 160,
        height: 240,
        // zoom: Phaser.Scale.MAX_ZOOM
        zoom: 4
    },
    type: Phaser.CANVAS,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: {
                y: constants.gravity
            }
        }
    },
    render: {
        pixelArt: true,
        antialias: false
    }
};

export class FlappyGame extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}

window.onload = async () => {
    const game = new FlappyGame(config);

    const firebase = new FirebaseDataStore("3");
    firebase.fetch().then(() => {
        (game.scene.getScene("GameScene") as BattleScene).configureDataStore(firebase);
    });
};
