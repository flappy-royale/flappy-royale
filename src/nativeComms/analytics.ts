export function analyticsEvent(name: string, params: any) {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.analyticsEvent.postMessage(JSON.stringify({ name, params }))
    } else if (window.Analytics) {
        window.Analytics.event(name, JSON.stringify(params || {}))
    } else if (window.ga) {
        window.ga("send", "event", name, "sent", name)
    } else {
        console.log("Sending analytics event", name)
    }
}

export function setUserProperty(name: string, value: string) {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.analyticsUserProperty.postMessage(JSON.stringify({ name, value }))
    } else if (window.Analytics) {
        window.Analytics.userProperty(name, value)
    } else {
        console.log("Setting user property", name)
    }
}

export function analyticsSetID(id: string) {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.analyticsSetID.postMessage(JSON.stringify({ id }))
    } else if (window.Analytics) {
        window.Analytics.setId(id)
    } else {
        console.log("Setting ID", id)
    }
}
