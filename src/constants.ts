export const APIVersion = "5"

/** Gets a consistent across all API versions seed for a day */
export const dailySeed = () => {
    const date = new Date()
    return `${APIVersion}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/** Gets a consistent across all API versions seed for an hour */
export const hourlySeed = () => {
    const date = new Date()
    return `${APIVersion}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

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
