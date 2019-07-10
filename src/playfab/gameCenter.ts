import { PlayfabAuth } from "../nativeApp"

export const gameCenterPromise = async (): Promise<PlayfabAuth | undefined> => {
    return Promise.resolve(undefined)
    // console.log("gameCenterPromise")
    // return new Promise((resolve, reject) => {
    //     console.log("In promise")
    //     // This iOS code will potentially wait for auth to complete or fail, then trigger the below event
    //     try {
    //         console.log("Trying")
    //         window.webkit.messageHandlers.gameCenterLogin.postMessage(true)

    //         window.addEventListener("gameCenterLogin", (e: any) => {
    //             console.log("MEssage returned", e.detail)
    //             if (e.detail) {
    //                 resolve({
    //                     method: "LoginWithGameCenter",
    //                     payload: {
    //                         PlayerId: e.detail.playerID,
    //                         PublicKeyUrl: e.detail.url,
    //                         Salt: atob(e.detail.salt),
    //                         Signature: atob(e.detail.signature),
    //                         Timestamp: e.detail.timestamp
    //                     }
    //                 })
    //             } else {
    //                 resolve(undefined)
    //             }
    //         })
    //     } catch {
    //         console.log("Catch")
    //         resolve(undefined)
    //     }
    // })
}
