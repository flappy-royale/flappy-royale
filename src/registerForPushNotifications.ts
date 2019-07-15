import { isAppleApp, isAndroidApp } from "./nativeComms/deviceDetection"
import playfabPromisify from "./playfabPromisify"
import { PlayFabClient } from "PlayFab-sdk"
import { loginPromise } from "./playFab"

export const registerForPushNotifications = async (): Promise<boolean> => {
    console.log("Registering for push notifs")
    if (isAppleApp() && window.webkit.messageHandlers.apns) {
        return new Promise((resolve, _) => {
            window.addEventListener("apnsDeviceToken", async (e: any) => {
                if (!e.detail.token) {
                    resolve(false)
                }
                await loginPromise
                await playfabPromisify(PlayFabClient.RegisterForIOSPushNotification)({
                    DeviceToken: e.detail.token
                }).catch(e => {
                    resolve(false)
                })

                resolve(true)
            })
            window.webkit.messageHandlers.apns.postMessage(true)
        })
    } else if (isAndroidApp() && window.PushNotifications) {
        console.log("Trying Android push notifs")
        return new Promise((resolve, _) => {
            window.addEventListener("deviceRegistrationToken", async (e: any) => {
                console.log("Received push notif token!", e.detail)
                if (!e.detail.token) {
                    resolve(false)
                }
                await loginPromise
                await playfabPromisify(PlayFabClient.AndroidDevicePushNotificationRegistration)({
                    DeviceToken: e.detail.token
                }).catch(e => {
                    resolve(false)
                })

                resolve(true)
            })
            window.PushNotifications!.register()
        })
    }
    return Promise.resolve(false)
}
