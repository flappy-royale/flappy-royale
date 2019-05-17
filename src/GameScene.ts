import * as Phaser from "phaser";
import * as Seed from "seed-random"
import * as _ from 'lodash'
import * as constants from "./constants"

import { PlayerEvent, FirebaseDataStore, PlayerData } from "./firebase";

interface SceneSettings {
  seed: string
}

export class GameScene extends Phaser.Scene {
  // Used for determining what opponents to grab
  apiVersion: string = "1"
  
  /** Your sprite  */
  bird: Phaser.Physics.Arcade.Sprite

  /** opponent */
  ghostBirds: Phaser.Physics.Arcade.Sprite[]
  
  /**  Every piece of a pipe */
  pipes: Phaser.Physics.Arcade.Group
  /** A timer for generating new pipes */
  newPipeTimer: Phaser.Time.TimerEvent

  /* So the scene can be re-used but time offsets can always be accurate */
  timestampOffset: number
  
  /** Keeping track of events from the user, sent up later */ 
  userInput: PlayerEvent[]
  /** Other players input events */
  recordedInput: PlayerData[] = []

  /** A place to grab user data from */
  dataStore: FirebaseDataStore

  /**  Number of MS to record the latest y-position */
  syncInterval = 400

  /** When we last stored the timestamp */
  lastSyncedTimestamp = 0

  /** A seed for the RNG function */
  seed: string
  
  /** The RNG function for this current run, and all ghosts*/
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
  }
  
  configureDataStore(dataStore: FirebaseDataStore) {
    this.dataStore = dataStore
    this.apiVersion = this.dataStore.apiVersion

    this.restartTheGame()
  }

  preload() { 
    this.load.image('bird', 'assets/Bird1.png'); 
    this.load.image('bird2', 'assets/old/bluebird-midflap.png'); 
    this.load.image('bird3', 'assets/old/bluebird-downflap.png'); 
    this.load.image('ghostbird', 'assets/old/redbird-upflap.png');     
    this.load.image('ghostbird2', 'assets/old/redbird-midflap.png');     
    this.load.image('ghostbird3', 'assets/old/redbird-downflap.png');           
    this.load.image('pipe', 'assets/old/pipebase.png');
    this.load.image('pipe-top', 'assets/PipeTop.png');
    this.load.image('pipe-body', 'assets/PipeLength.png');
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

    // Setup your bird's initial position
    this.bird = this.physics.add.sprite(constants.birdXPosition, 80, 'bird');
    this.bird.setData("tAngle", 0)
    this.bird.setOrigin(0.2,0.5)
    // this.bird.setTint(Math.random() * 16000000);

    // this.bird.play('flap')

    if (this.dataStore && this.dataStore.data) {
      this.recordedInput = _.cloneDeep(this.dataStore.data[this.seed] || [])
    }
   
    this.ghostBirds = []

    this.recordedInput.forEach(_ => {
      const ghost = this.physics.add.sprite(constants.birdXPosition, 80, 'bird');
      // ghost.setTint(Math.random() * 16000000);
      ghost.setAlpha(0.3)

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
      delay: constants.pipeTime, // We want 60px difference
      callback: () => this.addRowOfPipes(),
      callbackScope: this,
      loop: true
  });

    this.addRowOfPipes()

    // When anything reaches the edge of the world (e.g. the pipes, destroy them)
    this.physics.world.setBoundsCollision(true, false, false, false)
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      if (this.pipes.contains(body.gameObject)) {
        this.pipes.remove(body.gameObject, true, true)
      }
    })
  }

  flap(body: Phaser.Physics.Arcade.Body) {
    body.setVelocityY(-1 * constants.flapStrength)
  }

  rotateSprite(sprite: Phaser.Physics.Arcade.Sprite) {
    let lastAngle: number = sprite.getData("tAngle")
    let newAngle: number = 0;
    //later make bird always looking up until it falls enough that it's velocity down is like -50 and then rotate it
    /*let newAngle: number = 0;
    if(sprite.body.velocity.y > 0)
    {
      newAngle = -35
    }
    else
    {*/
      newAngle = this.remapClamped(sprite.body.velocity.y*-1, 0, 250, 0, 90)
    //}

    
    if(newAngle > lastAngle) {
      if(newAngle > 0)
        newAngle = lastAngle + (newAngle - lastAngle)/15
      else
        newAngle = lastAngle + (newAngle - lastAngle)/15
    } 

    sprite.setAngle(newAngle)
    sprite.setData("tAngle", newAngle)
  }

  remapClamped(value:number, fromA: number, fromB: number, toA: number, toB: number)
  {
    value = (value - fromA) / (toA - fromA) * (toB - fromB) + fromB;
    if(value < toA)
      value = toA
    if(value > toB)
      value = toB

    return value
  }

  addRowOfPipes() {
    // Randomly pick a number between 1 and 7
    // This will be the hole positioning
    const slots = 7
    
    // we have a height of 240 to work with ATM
    const windowHeight = 240
    // const windowHeight = this.game.canvas.height
    
    // Distance from the top / bottom
    const pipeEdgeBuffer = 170

    // get the distance between each potential intervak
    const pipeIntervals = (windowHeight - (pipeEdgeBuffer/2) - (constants.gapHeight /2)) / slots
    
    const holeSlot = Math.floor(this.rng() * 5) + 1;
    const holeTop = (pipeIntervals * holeSlot) + (pipeEdgeBuffer/2) - (constants.gapHeight/2)
    const holeBottom = (pipeIntervals * holeSlot) + (pipeEdgeBuffer/2) + (constants.gapHeight/2)
    
    const pipeTop = this.physics.add.sprite(180, holeTop, 'pipe-top')
    const pipeBottom = this.physics.add.sprite(180, holeBottom, 'pipe-bottom')
    this.addPipeSprite(pipeTop)
    this.addPipeSprite(pipeBottom)

    const pipeTopBody = this.physics.add.sprite(180, holeTop - 5, "pipe-body");
    pipeTopBody.setScale(1, 4000)
    this.addPipeSprite(pipeTopBody)

    const pipeBottomBody = this.physics.add.sprite(180, windowHeight, "pipe-body");
    pipeBottomBody.setScale(1, windowHeight - holeBottom - 5)
    this.addPipeSprite(pipeBottomBody)
  }

  addPipeSprite(pipe: Phaser.Physics.Arcade.Sprite) {

    // Add the pipe to our previously created group
    this.pipes.add(pipe);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -1 * constants.pipeSpeed; 
    
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
          this.flap(this.ghostBirds[index].body as Phaser.Physics.Arcade.Body)  
        } else if (action.action === "sync" && action.value !== undefined) {
          this.ghostBirds[index].body.position.y = action.value
        }
      }
    });
    
    // If the bird hits the floor 
    if (this.bird.y > 240 + 20) {
      this.restartTheGame()
    }

    // The collision of your bird and the pipes
    this.physics.overlap(this.bird, this.pipes, this.restartTheGame, null, this);

    this.rotateSprite(this.bird)
  }

  resetGame() {
    this.rng = Seed(this.seed)
    this.userInput = []
  }

  restartTheGame() {
    console.clear()
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

