const key = {
  left: false,
  right: false,
  up: false,
  down: false
};
const gamepads = [];

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
  document.documentElement.classList.remove("touch-device");
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.shiftKey && event.code === "KeyF"){
    event.preventDefault();
    if (document.webkitFullscreenEnabled && !document.fullscreenEnabled) (!document.webkitFullscreenElement) ? document.documentElement.webkitRequestFullscreen() : document.webkitExitFullscreen();
    if (document.fullscreenEnabled) (!document.fullscreenElement) ? document.documentElement.requestFullscreen() : document.exitFullscreen();
  }
  if (event.shiftKey) return;
  if (["Digit1","Digit2","Digit3","Digit4","Digit5","Digit6"].includes(event.code)){
    event.preventDefault();
    hotbar.setSlot(event.code.replace(/Digit/,""));
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
document.addEventListener("touchstart",() => document.documentElement.classList.add("touch-device"));
document.addEventListener("contextmenu",event => event.preventDefault());

export { key, gamepads };