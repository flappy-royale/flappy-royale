/** Makes a phaser image act a bit more like a button*/
export const becomeButton = (button: Phaser.GameObjects.Image | Phaser.GameObjects.BitmapText, action: Function, context?: any, relateds?: any[]) =>
    button
        .setInteractive()
        .on("pointerover", () => {
            button.setY(button.y + 1)
            if (relateds) {
                relateds.forEach(r => r.setY(r.y + 1))
            }
        })
        .on("pointerout", () => {
            button.setY(button.y - 1)
            if (relateds) {
                relateds.forEach(r => r.setY(r.y - 1))
            }
        })
        .on("pointerup", action, context)
