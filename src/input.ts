// input.js

// import { debug_toggle, hotbar } from "./app.js";
// import Flatlands from "./Flatlands.js";

// import type { HotbarSlotIndex } from "./Hotbar.js";

export type KeyLeft = boolean | "ArrowLeft" | "KeyA" | "DPadLeft";
export type KeyRight = boolean | "ArrowRight" | "KeyD" | "DPadRight";
export type KeyUp = boolean | "ArrowUp" | "KeyW" | "DPadUp";
export type KeyDown = boolean | "ArrowDown" | "KeyS" | "DPadDown";

export interface KeyState {
  left: KeyLeft;
  right: KeyRight;
  up: KeyUp;
  down: KeyDown;
}

declare global {
  interface Array<T extends string> {
    includes(searchElement: string, fromIndex?: number): searchElement is T;
  }

  interface Document {
    webkitExitFullscreen: Document["exitFullscreen"];
    webkitFullscreenElement: Document["fullscreenElement"];
    webkitFullscreenEnabled: Document["fullscreenEnabled"];
  }

  interface Element {
    webkitRequestFullscreen: Element["requestFullscreen"];
  }
}