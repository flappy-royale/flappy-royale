export enum GameMode {
    /** No player bird, resets when all birds are dead */
    Menu,
    /** Compete for attire */
    Royale,
    /** Compete against top scores */
    Trial = 2, // This needs to stay as 2, for the function to work reliably
    /** Infinite loop  */
    Training
}

/** Should the scene include the player bird? */
export const showPlayerBird = (mode: GameMode) => mode !== GameMode.Menu

/** Should we upload player events? */
export const shouldRecordScores = (mode: GameMode) => mode === GameMode.Royale || mode === GameMode.Trial

/** Should we upload player events? */
export const shouldRestartWhenAllBirdsAreDead = (mode: GameMode) => mode === GameMode.Menu

/** Should we show the player score? */
export const shouldShowScoreLabel = (mode: GameMode) => mode !== GameMode.Menu

/** Should we show many lives you have? */
export const shouldShowLivesLabel = (mode: GameMode) => mode === GameMode.Trial

/** Should we show your highest trial score? */
export const shouldShowHighScoreLabel = (mode: GameMode) => mode === GameMode.Trial

/** Should we show the birds left? */
export const shouldShowBirdsLeftLabel = (mode: GameMode) => mode === GameMode.Royale || mode === GameMode.Trial

/** Should we show the birds left? */
export const shouldRestartWhenPlayerDies = (mode: GameMode) => mode === GameMode.Training

/** Should we boot you out if you're out of lives? */
export const usesLives = (mode: GameMode) => mode === GameMode.Trial
