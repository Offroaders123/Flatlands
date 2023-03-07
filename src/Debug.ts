import Flatlands from "./Flatlands.js";
import { timeOrigin, tick, delta } from "./app.js";

export class Debug extends HTMLElement {
  #pre = document.createElement("pre");

  constructor() {
    super();
    this.append(this.#pre);
  }

  update() {
    this.#pre.textContent =
`Flatlands v${Flatlands.version}
Time Origin: ${timeOrigin}
Current Time: ${new Date().toLocaleTimeString()}
Game Time: ${Math.floor((Date.now() - timeOrigin) / 1000)}s
Ticks: ${tick}
Tick Time: ${Math.floor(tick / 60)}s
Milliseconds: ${Math.floor(tick / 60 * 1000)}ms
Frames: ${Flatlands.debug.frames}
Dropped Frames: ${Flatlands.debug.droppedFrames}
Frame Delta: ${Math.floor(delta).toString().padStart(2,"0")}`;
  }
}

window.customElements.define("debug-panel",Debug);

declare global {
  interface HTMLElementTagNameMap {
    "debug-panel": Debug;
  }
}

export default Debug;