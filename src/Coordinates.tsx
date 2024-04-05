import { player } from "./app.js";

export class Coordinates extends HTMLElement {
  update(): void {
    this.textContent = `(${Math.round(player.x / 16) * -1}, ${Math.round(player.y / 16)})`;
  }
}

window.customElements.define("coordinates-panel",Coordinates);

declare global {
  interface HTMLElementTagNameMap {
    "coordinates-panel": Coordinates;
  }
}

declare module "solid-js" {
  namespace JSX {
    interface HTMLElementTags {
      "coordinates-panel": HTMLAttributes<Coordinates>;
    }
  }
}

export default Coordinates;