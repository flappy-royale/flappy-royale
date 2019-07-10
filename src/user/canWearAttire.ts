import { PresentationAttire } from "../attire"
import { UserSettings } from "./userManager"
import * as _ from "lodash"

// This can be fairly naive because we'll verify actual ownership on the server.
export const canWearAttire = (settings: UserSettings, attire: PresentationAttire): boolean => {
    return attire.free || _.includes(settings.unlockedAttire, attire.id)
}
