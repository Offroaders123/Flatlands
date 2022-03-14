const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d",{ alpha: false });

let scaling = 4;

const offsetX = () => Math.round(canvas.width / 2);
const offsetY = () => Math.round((canvas.offsetHeight + (version.offsetHeight ? (version.offsetHeight + parseInt(window.getComputedStyle(hud).getPropertyValue("gap"))) : 0) + coordinates.offsetHeight - hotbar.offsetHeight) / scaling / 2);
/*
  The section of code above in offsetY(), having to do with window.getComputedStyle(), is a temporary fix for the new HUD overlap alignment checking feature. It is so the Flex gap is also included in the centering of player rendering, if and when the Version element is present.
  A likely fix for this in a future update will be to move the upper HUD elements into their own container, so instead that container could be used for HUD overlap checking within the game renderer.
*/

export { canvas, ctx, scaling, offsetX, offsetY };