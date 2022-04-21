const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d",{ alpha: false });

let scaling = 4;

const offsetX = () => Math.round(canvas.width / 2);
const offsetY = () => Math.round((canvas.offsetHeight + coordinates.offsetHeight - hotbar.offsetHeight - parseInt(window.getComputedStyle(hud).getPropertyValue("padding-bottom"))) / scaling / 2);

export { canvas, ctx, scaling, offsetX, offsetY };