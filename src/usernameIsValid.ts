import { list } from "google-profanity-words"

export const usernameIsValid = (name: string): boolean => {
    // Length check
    if (name.length < 3) {
        return false
    }

    // Profanity check
    const filterList = list()
    const words = name.split(" ")
    const anyFound = words.find(w => filterList.includes(w.toLowerCase()))
    if (anyFound) {
        return false
    }

    return true
}
