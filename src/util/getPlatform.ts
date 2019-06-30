type Platform = "ios" | "android" | "web"

/** What platform are we currently running on */
export const currentPlatform: Platform = window.isAppleApp ? "ios" : window.Analytics ? "android" : "web"
