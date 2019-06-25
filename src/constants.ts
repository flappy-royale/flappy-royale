// Changing this will mean new seed data for everything
export const APIVersion = "1"

// Are you working in a dev build?
export const isInDevMode = document.location.port === "8085"

export const GameWidth = 160
export let NotchOffset = 0
export let GameHeight = 0
export let GameAreaTopOffset = 0

// The HTML canvas is as tall as the device, but the playable vertical area is fixed
export const GameAreaHeight = 240

/** All methods of getting the window height in JS exclude the iPhone notch.
 * The best way we have to calculate notch height is to add a fake element,
 * and then grab the calculated safe area insets off of.
 * [insert sounds of exasperation]
 *
 * (This also needs to happen after document load, but before other things,
 * so we export this fn to let others control the flow)
 */
export function setDeviceSize() {
    const scale = GameWidth / screen.width

    if (CSS.supports("padding-top: env(safe-area-inset-top)")) {
        let div = document.createElement("div")
        div.style.paddingTop = "env(safe-area-inset-top)"
        document.body.appendChild(div)
        let calculatedPadding = parseInt(window.getComputedStyle(div).paddingTop || "0", 10)
        document.body.removeChild(div)
        NotchOffset = calculatedPadding * scale
    }

    GameHeight = window.innerHeight * scale + NotchOffset
    GameAreaTopOffset = NotchOffset && (GameHeight - GameAreaHeight) / 2

    // Handle landscape / desktop separately
    if (screen.width > screen.height) {
        GameHeight = GameAreaHeight
    }
}

// Battle Constants

/// Mysterious multiplier for the original game values from Zach
export const mapValue = 20
export const flapStrength = 6.8 * mapValue
export const gravity = 23 * mapValue
export const pipeSpeed = 2.9 * mapValue
export const timeBeforeFirstPipeLoads = 1800
export const pipeRepeatTime = 1300
export const gapHeight = 56
export const tutorialGapHeight = 110
export const tutorialGapSlot = 5
export const birdXPosition = -8
export const birdYPosition = 38
export const timeBetweenYSyncs = 400

export enum zLevels {
    ui = 14,
    uiBg = 13,
    ground = 12,
    pipe = 11,
    debugText = 13,
    birdWings = 12,
    birdAttire = 11,
    playerBird = 10,
    oneBelowBird = 9,
    twoBelowBird = 8,
    focusBackdrop = 1
}
