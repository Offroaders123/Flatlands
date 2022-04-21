import { item } from "./properties.js";

class ItemSlotElement extends HTMLElement {
  constructor() {
    super();
    this.defined = false;
  }
  connectedCallback() {
    if (this.defined || !this.isConnected) return;
    this.defined = true;
    this.appendChild(document.createElement("item-render"));
  }
  get value() {
    return this.getAttribute("value") || null;
  }
  set value(item) {
    if (this.value !== item) this.setAttribute("value",item);
  }
  get sprite() {
    return this.getAttribute("sprite") || null;
  }
  set sprite(texture) {
    const [id] = Object.keys(texture), { source, width, height, frames } = texture[id].texture;
    if (this.sprite === id) return;
    this.setAttribute("sprite",id);
    if (frames){
      this.setAttribute("animate","");
      this.style.setProperty("--width",`${width}px`);
      this.style.setProperty("--height",`${height}px`);
      this.style.setProperty("--frames",frames);
    }
    /* Another goal would be to add functionality to use the cached image itself (the line above, or `sprite`), rather than re-fetching it again in the CSS after being added as a style in `setSlotTexture()`. *edit: Super cool idea! Add canvases for each of the item renderers, rather than just an inline element, so then it can also eventually allow for item animations :O *edit2: or just use CSS instead :) (it's already implemented now!) */
    /* It could make sense to make this a method of either the hotbar element, or the hud container once an in-game inventory is implemented. Then you could update all item slots for an item to have a certain texture *edit: Almost there! This comment used to be in `properties.js`, but now all of the slot rendering logic is part of the slot element itself :) */
    this.querySelector("item-render").style.setProperty("background-image",`url("${source}")`);
  }
  render () {
    this.sprite = { [this.value]: item[this.value] };
  }
  activate() {
    hotbar.querySelectorAll("item-slot[active]").forEach(slot => slot.deactivate());
    this.setAttribute("active","");
  }
  deactivate() {
    this.removeAttribute("active");
  }
}

window.customElements.define("item-slot",ItemSlotElement);