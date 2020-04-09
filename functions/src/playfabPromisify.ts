// Copy/pasted from the file of the same name in src, don't want to deal with include logic
export default function<T extends PlayFabModule.IPlayFabResultCommon>(
    fn: (request: any, cb: PlayFabModule.ApiCallback<T>) => void
): (request: PlayFabModule.IPlayFabRequestCommon) => Promise<PlayFabModule.IPlayFabSuccessContainer<T>> {
    return (request: PlayFabModule.IPlayFabRequestCommon) => {
        return new Promise((resolve, reject) => {
            fn(request, (error: PlayFabModule.IPlayFabError, result: PlayFabModule.IPlayFabSuccessContainer<T>) => {
                if (error) {
                    console.error("Issue with API request:")
                    console.error(error)
                    console.error(request)
                    reject(error)
                }
                resolve(result)
            })
        })
    }
}
