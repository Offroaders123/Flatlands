import { debug_toggle, hotbar } from "./app.js";
import { Flatlands } from "./Flatlands.js";

interface Key {
  [name: string]: string | boolean;
}

export const key: Key = {
  left: false,
  right: false,
  up: false,
  down: false
};
export const gamepads: number[] = [];

window.addEventListener("gamepadconnected",event => {
  if (!event.gamepad.mapping) return;
  gamepads.push(event.gamepad.index);
  //console.log("Connected!\n",navigator.getGamepads()[event.gamepad.index]);
});
window.addEventListener("gamepaddisconnected",event => {
  if (!event.gamepad.mapping) return;
  //console.log("Disconnected.\n",event.gamepad.index);
  gamepads.splice(gamepads.indexOf(event.gamepad.index));
});

document.addEventListener("keydown",event => {
  if (event.repeat || document.activeElement != document.body) return;
  Flatlands.appearance.touch = false;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.shiftKey && event.code === "KeyD"){
    event.preventDefault();
    debug_toggle.click();
  }
  if (event.shiftKey && event.code === "KeyF"){
    event.preventDefault();
    // @ts-ignore
    if (document.webkitFullscreenEnabled && !document.fullscreenEnabled) (!document.webkitFullscreenElement) ? document.documentElement.webkitRequestFullscreen() : document.webkitExitFullscreen();
    if (document.fullscreenEnabled) (!document.fullscreenElement) ? document.documentElement.requestFullscreen() : document.exitFullscreen();
  }
  if (event.shiftKey) return;
  if (["Digit1","Digit2","Digit3","Digit4","Digit5","Digit6"].includes(event.code)){
    event.preventDefault();
    hotbar.setSlot(Number(event.code.replace(/Digit/,"")) - 1);
  }
  if (["ArrowLeft","KeyA"].includes(event.code)){
    event.preventDefault();
    key.left = event.code;
  }
  if (["ArrowRight","KeyD"].includes(event.code)){
    event.preventDefault();
    key.right = event.code;
  }
  if (["ArrowUp","KeyW"].includes(event.code)){
    event.preventDefault();
    key.up = event.code;
  }
  if (["ArrowDown","KeyS"].includes(event.code)){
    event.preventDefault();
    key.down = event.code;
  }
});
document.addEventListener("keyup",event => {
  if (document.activeElement != document.body) return;
  if (["ArrowLeft","KeyA"].includes(event.code)) key.left = false;
  if (["ArrowRight","KeyD"].includes(event.code)) key.right = false;
  if (["ArrowUp","KeyW"].includes(event.code)) key.up = false;
  if (["ArrowDown","KeyS"].includes(event.code)) key.down = false;
});
document.addEventListener("touchstart",() => Flatlands.appearance.touch = true);
document.addEventListener("contextmenu",event => event.preventDefault());