export function analyticsEvent(name: string, params: any) {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.analyticsEvent.postMessage(JSON.stringify({ name, params }))
    } else {
        console.log("Sending analytics event", name)
    }
}

export function setUserProperty(name: string, value: string) {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.analyticsUserProperty.postMessage(JSON.stringify({ name, value }))
    } else {
        console.log("Setting user property", name)
    }
}

export function analyticsSetID(id: string) {
    if (window.isAppleApp) {
        window.webkit.messageHandlers.analyticsSetID.postMessage(JSON.stringify({ id }))
    } else {
        console.log("Setting ID", id)
    }
}
