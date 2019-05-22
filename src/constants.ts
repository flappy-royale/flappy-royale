// Changing this will mean new seed data for everything
export const APIVersion = "5"

export const GameWidth = 160
export const GameHeight = 240

// Battle Constants

/// Mysterious multiplier for the original game values from Zach
export const mapValue = 20
export const flapStrength = 6.8 * this.mapValue
export const gravity = 23 * this.mapValue
export const pipeSpeed = 2.9 * this.mapValue
export const pipeTime = 1300
export const gapHeight = 56
export const birdXPosition = 20
export const birdYPosition = 30

export enum zLevels {
    debugText = 3,
    birdAttire = 2,
    playerBird = 1,
    ground = 2
}
