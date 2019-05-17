import * as Phaser from "phaser";
import * as Seed from "seed-random"

const pipeCenters = []

interface SceneSettings {
  seed: string
}

interface PlayerEvent {
  timestamp: number
  action: "flap"
}

export class GameScene extends Phaser.Scene {
  bird: Phaser.Physics.Arcade.Sprite
  pipes: Phaser.Physics.Arcade.Group
  newPipeTimer: Phaser.Time.TimerEvent

  timestampOffset: number
  userInput: PlayerEvent[]

  seed: string
  rng: () => number

  constructor(opts: SceneSettings) {
    super({
      key: "GameScene"
    });
    
    this.seed = (opts && opts.seed) || "12345"
    this.resetRNG()
    this.userInput = []
  }
  
  preload() { 
    this.load.image('bird', 'assets/bluebird-upflap.png'); 
    this.load.image('pipe', 'assets/pipebase.png');
  }

 create() { 
    this.bird = this.physics.add.sprite(100, 245, 'bird');
    this.pipes = this.physics.add.group(); 

    this.timestampOffset = 0
    
    // On spacebar bounce the bird
    var keyObj = this.input.keyboard.addKey('SPACE')
    const body = this.bird.body as Phaser.Physics.Arcade.Body
    keyObj.on('down', function(_event: KeyboardEvent) { 
      body.setVelocityY(-400)
      // console.log(this.time.time)
    });

    this.time.addEvent({
      delay: 1500,
      callback: () => {
        this.addRowOfPipes()
      },

      callbackScope: this,
      loop: true
  });

    this.addRowOfPipes()

    this.physics.world.setBoundsCollision(true, false, false, false)
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      console.log(body, "DESTROYING")
      body.gameObject.destroy()
    })
  }

  addRowOfPipes() {
    // Randomly pick a number between 1 and 5
    // This will be the hole position
    var hole = Math.floor(this.rng() * 5) + 1;

    // Add the 6 pipes 
    // With one big hole at position 'hole' and 'hole + 1'
    for (var i = 0; i < 8; i++) {
      if (i != hole && i != hole + 1) 
        this.addOnePipe(400, i * 60 + 10);   
    }
  }


  addOnePipe(x: number, y:number) {
    // Create a pipe at the position x and y
    var pipe = this.physics.add.sprite(x, y, 'pipe');

    // Add the pipe to our previously created group
    this.pipes.add(pipe);

    // Enable physics on the pipe 
    // this.physics.enable(pipe);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200; 
    
    const body = pipe.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)

    // Automatically kill the pipe when it's no longer visible 
    // pipe.body.checkWorldBounds = true;
    body.setCollideWorldBounds(true);
    body.onWorldBounds = true

    // Supposedly SO said this was slow, probably isn't for this case thought
    // this.scene.restart()
  }

  update(timestamp: number) {
    const adjustedTime = timestamp - this.timestampOffset
    console.log("Adjusted", this.timestampOffset, adjustedTime)

    // If the bird is out of the screen (too high or too low)
      // Call the 'restartGame' function

    if (this.bird.y < 0 || this.bird.y > 490) {
      this.restartTheGame()
    }

    // The collision of your bird and the pipes
    this.physics.overlap(this.bird, this.pipes, this.restartTheGame, null, this);
  }

  resetRNG() {
    this.rng = Seed(this.seed)
  }

  restartTheGame() {
  console.log("New offset", this.time.now)
    this.timestampOffset = this.time.now
    this.resetRNG()
    this.scene.restart()
  }
}

