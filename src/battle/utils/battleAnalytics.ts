import { GameResults } from "../../user/userManager"
import { BattleScene } from "../Scene"

/**
 * This class takes in a partial game, and keeps adding
 * to it until you've got everything sorted
 */
export class BattleAnalytics {
    private data: Partial<GameResults> = {}

    startRecording(input: Partial<GameResults>) {
        // Pull in partial data
        this.data.totalBirds = input.totalBirds

        // The scene is for aesthetics eventually
        this.data.startTimestamp = Date.now()

        // Restart this stuff, probably not needed bu
        // feels better
        this.data.score = 0
        this.data.position = -1
        this.data.flaps = 0
        this.data.mode = input.mode
    }

    flap() {
        this.data.flaps = (this.data.flaps || 0) + 1
    }

    finishRecording(results: { score: number; position: number }) {
        this.data.endTimestamp = Date.now()
        this.data.score = results.score
        this.data.position = results.position
    }

    getResults(): GameResults | undefined {
        return this.data as GameResults
    }
}
