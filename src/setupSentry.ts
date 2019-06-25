// Async sets up sentry. In theory this might not be able to catch launch issues
// but I don't want this to be a hard dependency that blocks you when you're
// somewhat offline. I think that's a reasonable trade.
export const setupSentry = () => {
    const script = document.createElement("script")
    script.src = "https://browser.sentry-cdn.com/5.4.3/bundle.min.js"
    script.crossOrigin = "anonymous"
    script.onload = () => {
        //@ts-ignore
        Sentry.init({ dsn: "https://20c21e70c6c84beeaf3cd916f775a0cc@sentry.io/1489512" })
    }
    document.getElementsByTagName("head")[0].appendChild(script)
}
