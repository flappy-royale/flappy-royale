// import {data} from "./examples"

import * as Phaser from "phaser";
import * as Seed from "seed-random"
import * as _ from 'lodash'
import { PlayerEvent, FirebaseDataStore, PlayerData } from "./firebase";

interface SceneSettings {
  seed: string
}

export class GameScene extends Phaser.Scene {
  apiVersion: string = "1"
  
  bird: Phaser.Physics.Arcade.Sprite

  ghostBirds: Phaser.Physics.Arcade.Sprite[]
  
  pipes: Phaser.Physics.Arcade.Group
  newPipeTimer: Phaser.Time.TimerEvent

  timestampOffset: number
  userInput: PlayerEvent[]
  recordedInput: PlayerData[] = []

  dataStore: FirebaseDataStore

  // Number of MS to record the latest y-position
  syncInterval: number = 400
  lastSyncedTimestamp: number = 0

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

    window.addEventListener('touchstart', () => {
      this.flap(this.bird.body as Phaser.Physics.Arcade.Body)
    })

    this.scene
  }
  
  configureDataStore(dataStore: FirebaseDataStore) {
    this.dataStore = dataStore
    this.apiVersion = this.dataStore.apiVersion

    this.restartTheGame()
  }

  preload() { 
    this.load.image('bird', 'assets/Bird1.png'); 
    this.load.image('bird-old', 'assets/old/bluebird-upflap.png'); 
    this.load.image('bird2', 'assets/old/bluebird-midflap.png'); 
    this.load.image('bird3', 'assets/old/bluebird-downflap.png');         
    this.load.image('ghostbird', 'assets/old/redbird-upflap.png');     
    this.load.image('ghostbird2', 'assets/old/redbird-midflap.png');     
    this.load.image('ghostbird3', 'assets/old/redbird-downflap.png');           
    this.load.image('pipe', 'assets/old/pipebase.png');
    this.load.image('pipe-top', 'assets/PipeTop.png');
    this.load.image('pipe-bottom', 'assets/PipeBottom.png');
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

    this.bird = this.physics.add.sprite(30, 140, 'bird');
    // this.bird.play('flap')

    if (this.dataStore && this.dataStore.data) {
      this.recordedInput = _.cloneDeep(this.dataStore.data[this.seed] || [])
    }
   
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
    body.setVelocityY(-200)
  }

  addRowOfPipes() {
    // Randomly pick a number between 1 and 7
    // This will be the hole positioning
    const slots = 7
    
    // we have a height of 240 to work with ATM
    const windowHeight = 240
    // const windowHeight = this.game.canvas.height
    
    // Distance from the top / bottom
    const pipeEdgeBuffer = 60
    // How big the gap is for the birds
    const distanceBetweenPipes = 52
    
    const pipeIntervals = (windowHeight - (pipeEdgeBuffer/2) - (distanceBetweenPipes /2)) / slots
    
    const holeSlot = Math.floor(this.rng() * 5) + 1;
    const holeTop = (pipeIntervals * holeSlot) + (pipeEdgeBuffer/2) - (distanceBetweenPipes/2)
    const holeBottom = (pipeIntervals * holeSlot) + (pipeEdgeBuffer/2) + (distanceBetweenPipes/2)
    
    this.addOnePipe(400, holeTop, 'pipe-top')
    this.addOnePipe(400, holeBottom, 'pipe-bottom')
    

    // const bottomOfTop = 12 //  windowHeight 

    // Add the 6 pipes 
    // With one big hole at position 'hole' and 'hole + 1' 
    // for (var i = 0; i < 8; i++) {
    //   if (i != hole && i != hole + 1) 
    //     this.addOnePipe(400, i * 10 + 10);
    // }
  }

  addOnePipe(x: number, y:number, sprite: string) {
    // Create a pipe at the position x and y
    var pipe = this.physics.add.sprite(x, y, sprite);

    // Add the pipe to our previously created group
    this.pipes.add(pipe);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -100; 
    
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

    if (adjustedTime - this.lastSyncedTimestamp >= this.syncInterval) {
      this.userInput.push({
        action: "sync",
        timestamp: adjustedTime,
        value: this.bird.body.position.y
      })
      this.lastSyncedTimestamp = adjustedTime
    }

    this.recordedInput.forEach((input, index) => {
      if (!input.actions) { return }
      while(input.actions.length > 0 && input.actions[0].timestamp < adjustedTime) {
        const action = input.actions.shift()
        if (action.action === "flap") {
          console.log("flapping")
          this.flap(this.ghostBirds[index].body as Phaser.Physics.Arcade.Body)  
        } else if (action.action === "sync" && action.value !== undefined) {
          this.ghostBirds[index].body.position.y = action.value
        }
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
    console.log(JSON.stringify(this.userInput, null, 2))


    if (window.location.hash !== "" && this.userInput.length > 4) {
      const name = window.location.hash.slice(1)
      this.dataStore.storeForSeed(this.seed, {
        name: name,
        apiVersion: this.apiVersion,
        actions: this.userInput
      })  
    }

    // this.timestampOffset = this.time.now
    this.time.update(0, 0)
    this.resetGame()
    this.scene.restart()
  }
}

