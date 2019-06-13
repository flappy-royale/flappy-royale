import * as constants from "../../constants"
import * as Phaser from 'phaser'

export function rightAlignTextLabel(label: Phaser.GameObjects.BitmapText, offset: number = 0) {
  const rightAligned = constants.GameWidth - label.getTextBounds(true).local.width - offset
  label.setX(rightAligned)
}