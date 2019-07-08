import { getUserStatistics } from "../user/userManager"
import { requestReview } from "../nativeComms/requestReview"

interface ReviewJSON {
    first: boolean
    second: boolean
    third: boolean
}

export const checkToShowRatingPrompt = () => {
    const userStats = getUserStatistics()

    // First gate, over 100 score + games played
    if (userStats.totalScore < 100) return
    if (userStats.gamesPlayed < 75) return

    const reviews = localStorage.getItem("reviews")
    if (!reviews) {
        const initialReviews: ReviewJSON = {
            first: true,
            second: false,
            third: false
        }

        localStorage.setItem("reviews", JSON.stringify(initialReviews))
        requestReview()
        return
    }

    const reviewJSON = JSON.parse(reviews) as ReviewJSON

    // Second gate, over 100 score + games played
    if (userStats.totalScore < 500) return
    if (userStats.gamesPlayed < 255) return

    if (!reviewJSON.second) {
        const newReviews: ReviewJSON = {
            first: true,
            second: true,
            third: false
        }

        localStorage.setItem("reviews", JSON.stringify(newReviews))
        requestReview()
        return
    }

    // Third gate, over 100 score + games played
    if (userStats.totalScore < 1000) return
    if (userStats.gamesPlayed < 500) return

    if (!reviewJSON.second) {
        const newReviews: ReviewJSON = {
            first: true,
            second: true,
            third: false
        }

        localStorage.setItem("reviews", JSON.stringify(newReviews))
        requestReview()
        return
    }
}
