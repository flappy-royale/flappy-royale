export const useDarkMode = () => {
    if (!window.matchMedia) return false

    const isNotSpecified = window.matchMedia("(prefers-color-scheme: no-preference)").matches
    if (isNotSpecified) return false

    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    return isDarkMode
}
