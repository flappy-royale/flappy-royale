import { PlayfabAuth } from "../nativeApp"

export const googlePlayGamesPromise = async (): Promise<PlayfabAuth | undefined> => {
    return new Promise((resolve, reject) => {
        console.log("In promise")
        try {
            console.log("Trying")
            if (!window.GooglePlayGames) {
                return resolve(undefined)
            }
            window.GooglePlayGames.auth()

            window.addEventListener("googlePlayGamesLogin", (e: any) => {
                console.log("Message returned", e.detail)
                if (e.detail) {
                    resolve({
                        method: "LoginWithGoogleAccount",
                        payload: {
                            ServerAuthCode: e.detail.serverAuthCode
                        }
                    })
                } else {
                    resolve(undefined)
                }
            })
        } catch {
            console.log("Catch")
            resolve(undefined)
        }
    })
}
