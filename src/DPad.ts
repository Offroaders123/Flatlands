import { key } from "./input.js";

export class DPad extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("touchstart",event => {
      this.down(event);
    },{ passive: false });
    
    this.addEventListener("touchend",event => {
      this.up(event);
    });
    
    this.addEventListener("pointerdown",event => {
      this.down(event);
    });
    
    this.addEventListener("pointerup",event => {
      this.up(event);
    });    
  }

  down(event: PointerEvent | TouchEvent) {
    if (!(event.target instanceof HTMLElement)) return;
    event.preventDefault();
  
    if (event.target.matches("button")){
      event.target.setAttribute("data-active","");
    }
  
    if (event.target.matches("[data-left]")){
      key.left = "DPadLeft";
    }
    if (event.target.matches("[data-right]")){
      key.right = "DPadRight";
    }
    if (event.target.matches("[data-up]")){
      key.up = "DPadUp";
    }
    if (event.target.matches("[data-down]")){
      key.down = "DPadDown";
    }
  }

  up(event: PointerEvent | TouchEvent) {
    if (!(event.target instanceof HTMLElement)) return;

    if (event.target.matches("button")){
      event.target.removeAttribute("data-active");
    }
  
    if (event.target.matches("[data-left]")){
      key.left = false;
    }
    if (event.target.matches("[data-right]")){
      key.right = false;
    }
    if (event.target.matches("[data-up]")){
      key.up = false;
    }
    if (event.target.matches("[data-down]")){
      key.down = false;
    }
  }
}

window.customElements.define("dpad-panel",DPad);

declare global {
  interface HTMLElementTagNameMap {
    "dpad-panel": DPad;
  }
}

export default DPad;