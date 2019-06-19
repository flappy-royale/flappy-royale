import { MainMenuScene } from "./menus/MainMenuScene";
import { rightAlignTextLabel } from "./battle/utils/alignTextLabel";
import { loadUpIntoSettings, loadUpIntoTraining } from "./app";
import { wait } from "./battle/utils/wait";
import { GameMode } from "./battle/utils/gameMode";
import { addScene } from "./menus/utils/addScene";
import { RoyaleLobby } from "./menus/RoyaleLobby";
import _ = require("lodash");

(window as any).setUpSnapshot = (name: string) => {
  window.addEventListener('gameloaded', async () => {
    const game = (window as any).currentGame

    if (name === "0MainMenu") {
      const menu = getScene("MainMenu") as MainMenuScene
      menu.playerNameText.setText("Em")

      menu.winsLabel.setText("wins: 10")
      rightAlignTextLabel(menu.winsLabel, 1)

    } else if (name === "1RoyaleLobby") {
      const menu = getScene("MainMenu") as MainMenuScene
      menu.removeMenu()
      const lobby: RoyaleLobby = new RoyaleLobby({ seed: "1-royale-0" })
      addScene(game, "RoyaleLobby1-royale-0", lobby, true, {})

      lobby.snapshotMode = true

      await wait(1000)

      let desiredNames = _.shuffle([
        "orta",
        "lazerwalker",
        "stfj",
        "increpare",
        "danger",
        "lyyyndsey",
        "dong_nguyen",
        "playerunknown"
      ])
      let nameList = document.querySelectorAll("#birds li p")

      for (let i = 0; i < desiredNames.length; i++) {
        (nameList[i] as HTMLLIElement).innerText = desiredNames[i]
      }

    } else if (name === "2Attire") {
      // TODO: Pick out some cool attire for the player

      loadUpIntoSettings(game)
      await wait(1000)

      // Scroll straight to attire
      document.querySelectorAll('.screen')[0].scrollTop = 150

    } else if (name === "3Game") {

      // TODO: This doesn't work
      // await loadUpIntoTraining(game, { offline: false, mode: GameMode.Royale })

      // await wait(6000)

      // console.log("About to pause?")
      // game.scene.pause("Battle")
      // game.scene.pause("GameScene0-royale-1")

    } else if (name === "4TrialResults") {
      // TODO

    } else {
      console.log("Snapshot name not recognized!", name)
    }

    // The XCUITests are waiting for the string "snapshotReady" to appear in the DOM
    document.getElementsByTagName('canvas')[0].insertAdjacentText("afterend", "snapshotReady")
  }, { once: true })
}

const getScene = (name: string) => (window as any).currentGame.scene.getScene(name)