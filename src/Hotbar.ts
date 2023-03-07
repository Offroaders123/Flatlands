import { player } from "./app.js";

export class Hotbar extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("touchstart",event => {
      if (!(event.target instanceof Element)) return;
      event.preventDefault();
      const slot = event.target.closest("item-slot");
      if (slot === null) return;
      this.setSlot(slot.index);
    },{ passive: false });
  }

  setSlot(index: number) {
    const slot = this.slots[index];
    slot.activate();
    player.hotbar.active = index;
  }

  get slots() {
    return [...this.querySelectorAll("item-slot")];
  }
}

window.customElements.define("hotbar-panel",Hotbar);

declare global {
  interface HTMLElementTagNameMap {
    "hotbar-panel": Hotbar;
  }
}

export default Hotbar;