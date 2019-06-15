import * as Phaser from "phaser"
import * as constants from "../../constants"

/** In order for HTML scrolling to work correctly, the scrollable element needs to be the height of the screen
 * We were setting this in CSS, but to support dynamic screen sizes, we need to set it via JS!
 */

export function resizeToFullScreen(dom: Phaser.GameObjects.DOMElement) {
    let screen = (dom.node as HTMLElement).getElementsByClassName("screen").item(0) as HTMLElement
    screen.style.height = `${constants.GameHeight}px`
    screen.style.marginTop = `${constants.NotchOffset}px`

    let footer = document.getElementById("footer-container") as HTMLElement
    footer.style.bottom = `${constants.NotchOffset}px`
}
