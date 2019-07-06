import _ = require("lodash")

export function isAppleApp() {
    return window.isAppleApp === true
}

export function isAndroidApp() {
    return !_.isUndefined(window.AndroidStaticData)
}
