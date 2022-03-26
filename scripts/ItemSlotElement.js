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
  set sprite({ source, width, height, frames } = texture) {
    if (this.sprite === source) return;
    this.setAttribute("sprite",source);
    if (frames){
      this.setAttribute("animate","");
      this.style.setProperty("--width",`${width}px`);
      this.style.setProperty("--height",`${height}px`);
      this.style.setProperty("--frames",frames);
    }
    this.querySelector("item-render").style.setProperty("background-image",`url("${source}")`);
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