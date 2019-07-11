// Wraps a PlayFab function in a promise!

// TODO: request is of a type that subclasses PlayFabModule.IPlayFabRequestCommon
// There has to be a way to represent that.

export type PlayFabApiMethod<T extends PlayFabModule.IPlayFabResultCommon> = (
    request: PlayFabModule.IPlayFabRequestCommon
) => Promise<PlayFabModule.IPlayFabSuccessContainer<T>>

export default function<T extends PlayFabModule.IPlayFabResultCommon>(
    fn: (request: any, cb: PlayFabModule.ApiCallback<T>) => void
): PlayFabApiMethod<T> {
    return (request: PlayFabModule.IPlayFabRequestCommon) => {
        return new Promise((resolve, reject) => {
            fn(request, (error: PlayFabModule.IPlayFabError, result: PlayFabModule.IPlayFabSuccessContainer<T>) => {
                if (error) {
                    reject(error)
                }
                resolve(result)
            })
        })
    }
}
