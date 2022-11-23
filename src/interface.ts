export class InterfaceElement extends HTMLElement {
  #canvas;
  #ctx;
  #hud;

  constructor() {
    super();

    this.innerHTML = `
      <canvas></canvas>
      <game-hud></game-hud>
    `;

    this.#canvas = this.querySelector("canvas")!;
    this.#ctx = this.#canvas.getContext("2d",{ alpha: false })!;
    this.#hud = this.querySelector("game-hud")!;
  }

  get canvas() {
    return this.#canvas;
  }

  get ctx() {
    return this.#ctx;
  }

  get hud() {
    return this.#hud;
  }
}

export class HudElement extends HTMLElement {
  #debugToggle;
  #debug;
  #coordinates;
  #hotbar;
  #dpad;

  constructor() {
    super();

    this.innerHTML = `
      <input type="checkbox" tabindex="-1" data-debug>
      <game-debug></game-debug>
      <game-coordinates></game-coordinates>
      <game-hotbar></game-hotbar>
      <game-dpad></game-dpad>
    `;

    this.#debugToggle = this.querySelector<HTMLInputElement>("input[data-debug]")!;
    this.#debug = this.querySelector("game-debug")!;
    this.#coordinates = this.querySelector("game-coordinates")!;
    this.#hotbar = this.querySelector("game-hotbar")!;
    this.#dpad = this.querySelector("game-dpad")!;
  }

  get debugToggle() {
    return this.#debugToggle;
  }

  get debug() {
    return this.#debug;
  }

  get coordinates() {
    return this.#coordinates;
  }

  get hotbar() {
    return this.#hotbar;
  }

  get dpad() {
    return this.#dpad;
  }
}

export class DebugElement extends HTMLElement {}

export class CoordinatesElement extends HTMLElement {}

export class HotbarElement extends HTMLElement {}

export class ItemSlotElement extends HTMLElement {}

export class DPadElement extends HTMLElement {}

window.customElements.define("game-interface",InterfaceElement);
window.customElements.define("game-hud",HudElement);
window.customElements.define("game-debug",DebugElement);
window.customElements.define("game-coordinates",CoordinatesElement);
window.customElements.define("game-hotbar",HotbarElement);
window.customElements.define("game-item-slot",HotbarElement);
window.customElements.define("game-dpad",DPadElement);

declare global {
  interface HTMLElementTagNameMap {
    "game-interface": InterfaceElement;
    "game-hud": HudElement;
    "game-debug": DebugElement;
    "game-coordinates": CoordinatesElement;
    "game-hotbar": HotbarElement;
    "game-item-slot": HotbarElement;
    "game-dpad": DPadElement;
  }
}