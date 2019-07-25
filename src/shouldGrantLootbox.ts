import { LootboxTier } from "../functions/src/LootboxTier"

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const shouldGrantLootbox = (score: number, won: boolean = false): LootboxTier | null => {
    if (won) {
        return LootboxTier.Neon
    } else if (score >= 30) {
        if (rand(1, 100) <= 10) return LootboxTier.Neon
        if (rand(1, 100) <= 80) return LootboxTier.Gold
        if (rand(1, 100) <= 25) return LootboxTier.Silver
        if (rand(1, 100) <= 10) return LootboxTier.Bronze
    } else if (score >= 20) {
        if (rand(1, 100) <= 1) return LootboxTier.Neon
        if (rand(1, 100) <= 50) return LootboxTier.Gold
        if (rand(1, 100) <= 25) return LootboxTier.Silver
        if (rand(1, 100) <= 10) return LootboxTier.Bronze
    } else if (score >= 10) {
        if (rand(1, 100) <= 1) return LootboxTier.Neon
        if (rand(1, 100) <= 3) return LootboxTier.Gold
        if (rand(1, 100) <= 25) return LootboxTier.Silver
        if (rand(1, 100) <= 10) return LootboxTier.Bronze
    } else if (score >= 2) {
        if (rand(1, 100) <= 1) return LootboxTier.Neon
        if (rand(1, 100) <= 2) return LootboxTier.Gold
        if (rand(1, 100) <= 5) return LootboxTier.Silver
        if (rand(1, 100) <= 10) return LootboxTier.Bronze
    } else if (score >= 1) {
        if (rand(1, 100) <= 5) return LootboxTier.Bronze
    }

    return null
}
