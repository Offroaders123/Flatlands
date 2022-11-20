import { hotbar } from "./app.js";
import { item } from "./properties.js";

export class ItemSlotElement extends HTMLElement {
  #isDefined = false;

  connectedCallback() {
    if (this.#isDefined || !this.isConnected) return;
    this.#isDefined = true;
    this.appendChild(document.createElement("item-render"));
  }

  get value() {
    return this.getAttribute("value") || null;
  }

  set value(value) {
    if (this.value === value) return;
    this.setAttribute("value",value);
    this.sprite = { [value]: item[value] };// Look at the note below, this is what I am talking about XD
  }

  get sprite() {
    return this.getAttribute("sprite") || null;
  }

  set sprite(texture: { [name: string]: typeof item[keyof typeof item]; }) {// Note to me: pleeease tidy up this parameter usage, it's really ugly at the moment.
    const [id] = Object.keys(texture);
    const { source, width = 16, height = 16 } = texture[id].texture;
    const { animation } = texture[id];
    if (this.sprite === id) return;
    this.setAttribute("sprite",id);
    if (animation){
      this.setAttribute("animate","");
      this.style.setProperty("--width",`${width}px`);
      this.style.setProperty("--height",`${height}px`);
      this.style.setProperty("--duration",`${animation.duration}ms`);
      this.style.setProperty("--keyframes",animation.keyframes);
    }
    /* Another goal would be to add functionality to use the cached image itself (the line above, or `sprite`), rather than re-fetching it again in the CSS after being added as a style in `setSlotTexture()`. *edit: Super cool idea! Add canvases for each of the item renderers, rather than just an inline element, so then it can also eventually allow for item animations :O *edit2: or just use CSS instead :) (it's already implemented now!) */
    /* It could make sense to make this a method of either the hotbar element, or the hud container once an in-game inventory is implemented. Then you could update all item slots for an item to have a certain texture *edit: Almost there! This comment used to be in `properties.js`, but now all of the slot rendering logic is part of the slot element itself :) */
    this.querySelector<HTMLElement>("item-render")!.style.setProperty("background-image",`url("${source}")`);
  }

  render() {
    this.sprite = { [this.value]: item[this.value] };
  }

  activate() {
    hotbar.querySelectorAll<ItemSlotElement>("item-slot[active]").forEach(slot => slot.deactivate());
    this.setAttribute("active","");
  }

  deactivate() {
    this.removeAttribute("active");
  }
}

window.customElements.define("item-slot",ItemSlotElement);