import * as Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  delta: number;
  lastStarTime: number;
  starsCaught: number;
  starsFallen: number;
  sand: Phaser.Physics.Arcade.StaticGroup;
  info: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "GameScene"
    });

    this.delta = 1000;
    this.lastStarTime = 0;
    this.starsCaught = 0;
    this.starsFallen = 0;
  }
  
  init(params: any): void {
    // TODO
  }

  preload(): void {
    this.load.setBaseURL("https://raw.githubusercontent.com/mariyadavydova/" + "starfall-phaser3-typescript/master/");
    this.load.image("star", "assets/star.png");
    this.load.image("sand", "assets/sand.jpg");
  }

  create(): void {
    this.sand = this.physics.add.staticGroup({
      key: "sand",
      frameQuantity: 20
    });

    Phaser.Actions.PlaceOnLine(
      this.sand.getChildren(),
      new Phaser.Geom.Line(20, 580, 820, 580)
    );

    this.sand.refresh();
    this.info = this.add.text(10, 10, "starfaaaall", {
      font: "24px Arial Bold",
      fill: "#F00"
    });
  }

  update(time: number): void {
    var diff: number = time - this.lastStarTime;
    if (diff > this.delta) {
      this.lastStarTime = time;
      if (this.delta > 500) {
        this.delta -= 20;
      }
      this.emitStar();
    }

    this.info.text = `${this.starsCaught} caught - ${this.starsFallen} fallen (max 3)`
  }

  private onClick(star: Phaser.Physics.Arcade.Image): () => void {
    return function () {
      star.setTint(0x00ff00);
      star.setVelocity(0, 0);
      this.starsCaught += 1;
      this.time.delayedCall(100, function (star) {
        star.destroy();
      }, [star], this);
    }
  }
  
private onFall(star: Phaser.Physics.Arcade.Image): () => void {
    return function () {
      star.setTint(0xff0000);
      this.starsFallen += 1;
      this.time.delayedCall(100, function (star) {
        star.destroy();
      }, [star], this);
    }
  }

  private emitStar(): void {
    var star: Phaser.Physics.Arcade.Image;
    var x = Phaser.Math.Between(25, 775);
    var y = 26;
    
    star = this.physics.add.image(x, y, "star");
    star.setDisplaySize(50, 50);
    star.setVelocity(0, 200);
    star.setInteractive();
    star.on('pointerdown', this.onClick(star), this);
    
    this.physics.add.collider(star, this.sand, this.onFall(star), null, this);
  }
}

