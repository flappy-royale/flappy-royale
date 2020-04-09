import { PlayFabServer } from "playfab-sdk"

export default () => {
    PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET
    PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE
}
