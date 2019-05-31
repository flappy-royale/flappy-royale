import { MainMenuScene } from "../MainMenuScene"
import { GameWidth, GameHeight } from "../../constants"

export const preloadBackgroundBlogImages = (scene: MainMenuScene) => {
    scene.load.image("blob-1", require("../../../assets/menu/blob-1.png"))
    scene.load.image("blob-2", require("../../../assets/menu/blob-2.png"))
    scene.load.image("blob-3", require("../../../assets/menu/blob-3.png"))
    scene.load.image("blob-4", require("../../../assets/menu/blob-4.png"))
    scene.load.image("blob-5", require("../../../assets/menu/blob-5.png"))

    scene.load.image("bottom-left", require("../../../assets/menu/BottomLeft.png"))
    scene.load.image("bottom-right", require("../../../assets/menu/BottomRight.png"))

    scene.load.image("red-bottom-left", require("../../../assets/menu/red-bottom-left.png"))
    scene.load.image("red-top-left", require("../../../assets/menu/red-top-left.png"))
    scene.load.image("red-bottom-right", require("../../../assets/menu/red-bottom-right.png"))
    scene.load.image("red-top-right", require("../../../assets/menu/red-top-right.png"))
}

export const setupBackgroundBlogImages = (scene: MainMenuScene) => {
    const w = GameWidth
    const h = GameHeight
    const min = 100
    scene.add.image(rand(-10, w + 10), rand(min, h), "blob-1")
    scene.add.image(rand(-10, w + 10), rand(min, h), "blob-2")
    scene.add.image(rand(-10, w + 10), rand(min, h), "blob-3")
    scene.add.image(rand(0, w), rand(min, h), "blob-4")
    scene.add.image(rand(0, w), rand(min, h), "blob-5")
    scene.add.image(rand(0, w), rand(min, h), "blob-1").setRotation(Math.PI)
    scene.add.image(rand(0, w), rand(min, h), "blob-2").setRotation(Math.PI)
    scene.add.image(rand(0, w), rand(min, h), "blob-3").setRotation(Math.PI)
    scene.add.image(rand(0, w), rand(min, h), "blob-4").setRotation(Math.PI)
    scene.add.image(rand(0, w), rand(min, h), "blob-5").setRotation(Math.PI)

    scene.add.image(40, h - 20, "bottom-left")
    scene.add.image(130, h - 8, "bottom-right")

    scene.add.image(shuffle(25), shuffle(16), "red-top-left")
    scene.add.image(shuffle(134), shuffle(24), "red-top-right")
    scene.add.image(shuffle(25), shuffle(80), "red-bottom-left")
    scene.add.image(shuffle(134), shuffle(80), "red-bottom-right")
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const shuffle = (num: number) => rand(num - 3, num + 3)
