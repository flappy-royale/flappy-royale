import { isAppleApp, isAndroidApp } from "./nativeComms/deviceDetection"
import { currentAppleVersion, currentAndroidVersion } from "../assets/config/currentVersion"

/** Returns true if:
 * - It's a web build
 * - It's a native build whose major and minor version match what we've stored in assets/constants
 *
 * Currently, patch versions will show up as acceptable – parseFloat("1.2.3") === 1.2
 */
export function versionIsCurrent(): boolean {
    if (isAppleApp()) {
        return true // parseFloat(window.appVersion) >= currentAppleVersion
    } else if (isAndroidApp()) {
        return parseFloat(window.appVersion) >= currentAndroidVersion
    }
    return true
}

export function downloadURL(): string {
    if (isAppleApp()) {
        return "https://apps.apple.com/us/app/flappy-royale/id1469168509"
    } else if (isAndroidApp()) {
        return "https://play.google.com/store/apps/details?id=com.lazerwalker.flappyroyale"
    } else {
        return "https://flappyroyale.io"
    }
}
