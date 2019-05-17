import {data} from "./examples"

import * as Phaser from "phaser";
import * as Seed from "seed-random"
import * as _ from 'lodash'

interface SceneSettings {
  seed: string
}

interface PlayerEvent {
  timestamp: number
  action: "flap"
}

export class GameScene extends Phaser.Scene {
  bird: Phaser.Physics.Arcade.Sprite

  ghostBirds: Phaser.Physics.Arcade.Sprite[]
  
  pipes: Phaser.Physics.Arcade.Group
  newPipeTimer: Phaser.Time.TimerEvent

  timestampOffset: number
  userInput: PlayerEvent[]
  recordedInput: typeof import("./examples").data

  seed: string
  rng: () => number

  constructor(opts: SceneSettings) {
    super({
      key: "GameScene"
    });
    
    this.seed = (opts && opts.seed) || "12345"
    this.resetGame()
    this.userInput = []
    this.ghostBirds = []
    this.timestampOffset = 0
  }
  
  preload() { 
    this.load.image('bird', 'assets/bluebird-upflap.png'); 
    this.load.image('bird2', 'assets/bluebird-midflap.png'); 
    this.load.image('bird3', 'assets/bluebird-downflap.png');         
    this.load.image('ghostbird', 'assets/redbird-upflap.png');     
    this.load.image('ghostbird2', 'assets/redbird-midflap.png');     
    this.load.image('ghostbird3', 'assets/redbird-downflap.png');           
    this.load.image('pipe', 'assets/pipebase.png');
  }

 create() { 
    this.anims.create({
      key: 'flap',
      frames: [
          { key: 'bird', frame: 0 },
          { key: 'bird2', frame: 1 },
          { key: 'bird3', frame: 2 }
      ],
      frameRate: .8,
      repeat: -1
    })

    this.anims.create({
      key: 'ghostFlap',
      frames: [
          { key: 'ghostbird', frame: 0 },
          { key: 'ghostbird2', frame: 1 },
          { key: 'ghostbird3', frame: 2 }
      ],
      frameRate: 8,
      repeat: -1
    })

    this.bird = this.physics.add.sprite(100, 245, 'bird');
    this.bird.play('flap')

    this.recordedInput = _.cloneDeep(data)
   
    this.ghostBirds = []

    this.recordedInput.forEach(_ => {
      const ghost = this.physics.add.sprite(100, 245, 'ghostbird');
      ghost.play('ghostFlap')
      this.ghostBirds.push(ghost)
    });

    this.pipes = this.physics.add.group(); 

    
    // On spacebar bounce the bird
    var keyObj = this.input.keyboard.addKey('SPACE')
    const body = this.bird.body as Phaser.Physics.Arcade.Body
    const inputs = this.userInput
    
    keyObj.on('down', (_event: KeyboardEvent) => { 
      this.flap(body)
      inputs.push({ action: "flap", timestamp: this.time.now - this.timestampOffset })
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
      body.gameObject.destroy()
    })
  }

  flap(body: Phaser.Physics.Arcade.Body) {
    body.setVelocityY(-400)
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

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200; 
    
    const body = pipe.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)

    // Automatically kill the pipe when it's no longer visible 
    body.setCollideWorldBounds(true);
    body.onWorldBounds = true
  }

  update(timestamp: number) {
    const adjustedTime = timestamp - this.timestampOffset
    // console.log(this.timestampOffset)
    // console.log(adjustedTime, this.recordedInput[0] && this.recordedInput[0].actions[0].timestamp   )

    this.recordedInput.forEach((input, index) => {
      while(input.actions.length > 0 && input.actions[0].timestamp < adjustedTime) {
        // Right now, the only action is "flap"
        const action = input.actions.shift()
        console.log("flapping")
        this.flap(this.ghostBirds[index].body as Phaser.Physics.Arcade.Body)
      }
    });
    
    // If the bird is out of the screen (too high or too low)
      // Call the 'restartGame' function

    if (this.bird.y < 0 || this.bird.y > 490) {
      this.restartTheGame()
    }

    // The collision of your bird and the pipes
    this.physics.overlap(this.bird, this.pipes, this.restartTheGame, null, this);
  }

  resetGame() {
    this.rng = Seed(this.seed)
    this.userInput = []
  }

  restartTheGame() {
    // console.clear()
    // console.log(JSON.stringify(this.userInput, null, 2))
    this.timestampOffset = this.time.now
    this.resetGame()
    this.scene.restart()
  }
}

