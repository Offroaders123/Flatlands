import { key } from "./input.js";

class DPadElement extends HTMLElement {
  constructor() {
    super();
    this.defined = false;
    this.buttons = {};
    const template = document.createElement("button");
    template.tabIndex = -1;
    this.buttons.left = template.cloneNode();
    this.buttons.left.setAttribute("data-left","");
    this.buttons.right = template.cloneNode();
    this.buttons.right.setAttribute("data-right","");
    this.buttons.up = template.cloneNode();
    this.buttons.up.setAttribute("data-up","");
    this.buttons.down = template.cloneNode();
    this.buttons.down.setAttribute("data-down","");
  }
  connectedCallback() {
    if (this.defined || !this.isConnected) return;
    this.defined = true;
    Object.values(this.buttons).forEach(button => this.appendChild(button));
    this.addEventListener("touchstart",this.down);
    this.addEventListener("touchend",this.up);
    this.addEventListener("pointerdown",this.down);
    this.addEventListener("pointerup",this.up);
  }
  down(event) {
    event.preventDefault();
    if (event.target.matches("button")) event.target.setAttribute("data-active","");
    if (event.target.matches("[data-left]")) key.left = "DPadLeft";
    if (event.target.matches("[data-right]")) key.right = "DPadRight";
    if (event.target.matches("[data-up]")) key.up = "DPadUp";
    if (event.target.matches("[data-down]")) key.down = "DPadDown";
  };
  up(event) {
    if (event.target.matches("button")) event.target.removeAttribute("data-active");
    if (event.target.matches("[data-left]")) key.left = false;
    if (event.target.matches("[data-right]")) key.right = false;
    if (event.target.matches("[data-up]")) key.up = false;
    if (event.target.matches("[data-down]")) key.down = false;
  };
}

window.customElements.define("d-pad",DPadElement);