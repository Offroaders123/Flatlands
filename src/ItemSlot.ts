import { hotbar } from "./app.js";
import { item } from "./properties.js";

import type { ItemID, UnionToIntersection } from "./properties.js";
import type { HotbarSlotIndex } from "./Hotbar.js";

export class ItemSlot extends HTMLElement {
  #itemRender = document.createElement("item-render");

  constructor() {
    super();
    this.append(this.#itemRender);
  }

  get value(): ItemID {
    return this.getAttribute("value")! as ItemID;
  }

  set value(value: ItemID) {
    if (this.value === value) return;
    this.setAttribute("value",value);
    this.sprite = value;
  }

  get index(): HotbarSlotIndex {
    return Number(this.getAttribute("index")) as HotbarSlotIndex;
  }

  get sprite(): ItemID {
    return this.getAttribute("sprite")! as ItemID;
  }

  set sprite(id: ItemID) {
    const itemEntry = item[id];
    const { texture, animation } = itemEntry as UnionToIntersection<typeof item[typeof id]>;
    const { source, width = 16, height = 16 } = texture;
    if (this.sprite === id) return;

    this.setAttribute("sprite",id);

    if (animation){
      this.setAttribute("animate","");
      this.style.setProperty("--width",`${width}px`);
      this.style.setProperty("--height",`${height}px`);
      this.style.setProperty("--duration",`${animation.duration}ms`);
      this.style.setProperty("--keyframes",`${animation.keyframes}`);
    }

    /* Another goal would be to add functionality to use the cached image itself (the line above, or `sprite`), rather than re-fetching it again in the CSS after being added as a style in `setSlotTexture()`. *edit: Super cool idea! Add canvases for each of the item renderers, rather than just an inline element, so then it can also eventually allow for item animations :O *edit2: or just use CSS instead :) (it's already implemented now!) */
    /* It could make sense to make this a method of either the hotbar element, or the hud container once an in-game inventory is implemented. Then you could update all item slots for an item to have a certain texture *edit: Almost there! This comment used to be in `properties.js`, but now all of the slot rendering logic is part of the slot element itself :) */
    this.#itemRender.style.setProperty("background-image",`url("${source}")`);
  }

  render(): void {
    this.sprite = this.value;
  }

  activate(): void {
    for (const slot of hotbar.querySelectorAll<ItemSlot>("item-slot[active]")){
      slot.deactivate();
    }
    this.setAttribute("active","");
  }

  deactivate(): void {
    this.removeAttribute("active");
  }
}

window.customElements.define("item-slot",ItemSlot);

declare global {
  interface HTMLElementTagNameMap {
    "item-slot": ItemSlot;
  }
}

export default ItemSlot;