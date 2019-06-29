import { PlayFabClient } from "PlayFab-sdk"

class PlayFab {
    isLoggedIn: boolean = false

    login() {
        PlayFabClient.settings.titleId = "BBB0C"
        const loginRequest = {
            // Currently, you need to look up the correct format for this object in the API-docs:
            // https://api.playfab.com/documentation/Client/method/LoginWithCustomID
            TitleId: PlayFabClient.settings.titleId,
            CustomId: "1234",
            CreateAccount: true
        }

        PlayFabClient.LoginWithCustomID(loginRequest, (result, error) => {
            if (!error) {
                this.isLoggedIn = true
            }
        })
    }

    updateName(name: string) {
        PlayFabClient.UpdateUserTitleDisplayName({ DisplayName: name }, (error: any, result) => {
            if (!error) {
                this.isLoggedIn = true
            }
            console.log(error, result)
        })
    }

    sendTrialScore(score: number) {
        PlayFabClient.UpdatePlayerStatistics(
            {
                Statistics: [
                    {
                        StatisticName: "DailyTrial",
                        Value: score
                    }
                ]
            },
            () => {}
        )
    }
}

export default new PlayFab()
