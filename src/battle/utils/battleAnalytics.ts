import { GameResults } from "../../user/userManager"
import { BattleScene } from "../Scene"

/**
 * This class takes in a partial game, and keeps adding
 * to it until you've got everything sorted
 */
export class BattleAnalytics {
    private data: Partial<GameResults> = {}

    startRecording(_scene: BattleScene) {
        // The scene is for aesthetics eventually
        this.data.startTimestamp = Date.now()

        // Restart this stuff, probably not needed bu
        // feels better
        this.data.score = 0
        this.data.position = -1
        this.data.flaps = 0
    }

    flap() {
        this.data.flaps = (this.data.flaps || 0) + 1
    }

    finishRecording(results: { score: number; position: number }) {
        this.data.endTimestamp = Date.now()
        this.data.score = results.score
        this.data.position = results.position
    }

    getResults(): GameResults {
        return this.data as GameResults
    }
}
