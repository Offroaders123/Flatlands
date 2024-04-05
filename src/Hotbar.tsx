import { player } from "./app.js";

import type ItemSlot from "./ItemSlot.js";

// Future goal: Can I create this tuple from a map of the `Player["hotbar"]["slots"]` key type?
export type HotbarSlots = [ItemSlot,ItemSlot,ItemSlot,ItemSlot,ItemSlot,ItemSlot];
export type HotbarSlotIndex = Extract<keyof HotbarSlots,`${number}`> extends `${infer U extends number}` ? U : never;

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

  setSlot(index: HotbarSlotIndex): void {
    const slot = this.slots[index];
    slot.activate();
    player.hotbar.active = index;
  }

  get slots(): HotbarSlots {
    return [...this.querySelectorAll("item-slot")] as HotbarSlots;
  }
}

window.customElements.define("hotbar-panel",Hotbar);

declare global {
  interface HTMLElementTagNameMap {
    "hotbar-panel": Hotbar;
  }
}

declare module "solid-js" {
  namespace JSX {
    interface HTMLElementTags {
      "hotbar-panel": HTMLAttributes<Hotbar>;
    }
  }
}

export default Hotbar;