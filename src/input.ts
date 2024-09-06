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