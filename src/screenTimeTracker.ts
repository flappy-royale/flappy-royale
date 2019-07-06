/** This is an implementation of PlayFab Screen Time tracking, a feature that currently only officially exists in their Unity SDK:
 * https://github.com/PlayFab/UnitySDK/blob/b363ef78ca779358af2ad96cf53d038c5d8660c4/Source/PlayFabSDK/Entity/ScreenTimeTracker.cs
 */

import * as uuid from "uuid/v4"
import * as playFab from "./playFab"
import { isAndroidApp } from "./nativeComms/deviceDetection"

interface FocusPeriod {
    uuid: string
    startTime: Date
    hasFocus: boolean
}

let currentFocus: FocusPeriod
let gameSessionUUID: string
let queue: PlayFabEventsModels.EventContents[] = []

export const setUpScreenTracking = () => {
    // Android visibility is currently messed up
    if (isAndroidApp()) {
        return
    }
    window.addEventListener("visibilitychange", () => {
        sessionFocusEvent(!document.hidden)
    })
    startedSession()
}

export const startedSession = () => {
    console.log("Started session")
    gameSessionUUID = uuid()

    let payload: any = {
        ClientSessionID: gameSessionUUID
    }

    if (window.playfabAuth && window.playfabAuth.payload.DeviceModel) {
        payload.DeviceModel = window.playfabAuth.payload.DeviceModel
    }

    if (window.playfabAuth && window.playfabAuth.payload.AndroidDevice) {
        payload.DeviceModel = window.playfabAuth.payload.AndroidDevice
    }

    if (window.playfabAuth && window.playfabAuth.payload.OS) {
        payload.OS = window.playfabAuth.payload.OS
    }

    const event = constructEvent("client_session_start", payload)
    queue.push(event)

    // Fake a focus-on event at the time of the first login:
    sessionFocusEvent(true)
}

export const sessionFocusEvent = (hasFocus: boolean) => {
    console.log("Session focus", hasFocus)
    if (currentFocus && currentFocus.hasFocus === hasFocus) {
        console.log("Last status event is the same as this one, not doing anything")
        return
    }

    let duration: number = 0
    let focusId: string

    if (currentFocus) {
        duration = (new Date().getTime() - currentFocus.startTime.getTime()) / 1000
    } else {
        // Dummy data
        currentFocus = {
            uuid: "",
            startTime: new Date(),
            hasFocus: true
        }
    }

    if (hasFocus) {
        focusId = uuid()
        currentFocus.uuid = focusId
    } else {
        focusId = currentFocus.uuid
    }

    currentFocus.startTime = new Date()
    currentFocus.hasFocus = hasFocus

    const payload: any = {
        FocusID: focusId,
        FocusStateDuration: duration,
        FocusState: hasFocus,
        EventTimestamp: new Date().toJSON(),
        ClientSessionID: gameSessionUUID
    }
    const event = constructEvent("client_focus_change", payload)
    queue.push(event)

    if (!hasFocus) {
        flushQueue()
    }
}

const constructEvent = (
    name: "client_session_start" | "client_focus_change",
    payload: any
): PlayFabEventsModels.EventContents => {
    const result = {
        Name: name,
        EventNamespace: "com.playfab.events.sessions",
        Payload: payload,
        OriginalTimestamp: new Date().toJSON() // TODO: This is DateTime.UtcNow. How is that serialized in Unity?
    }
    console.log(result)
    return result
}

const maxEventsInRequest = 10
export const flushQueue = async () => {
    const events = queue.splice(0, maxEventsInRequest)
    console.log("Flushing queue", events)

    try {
        await playFab.writeScreenTrackingEvents(events)
    } catch (e) {
        events.unshift(...events)
    }
}
