// ES Module imports
import Flatlands from "./Flatlands.js";

// Service Worker
await Flatlands.serviceWorker.register();

// Touch Device
if (Flatlands.environment.touchDevice) document.documentElement.classList.add("touch-device");

// Canvas
import { canvas, ctx, scaling, offsetX, offsetY } from "./canvas.js";

new ResizeObserver(() => {
  const { offsetWidth: width, offsetHeight: height } = canvas;
  canvas.width = width / scaling;
  canvas.height = height / scaling;
  ctx.imageSmoothingEnabled = false;
  animate({ recursive: false });
}).observe(canvas);

let tick = 0;

// HUD
const hud = document.querySelector("#hud");

// Version
const version = document.querySelector("#version");
version.textContent = `Flatlands v${Flatlands.version}`;

// Coordinates
const coordinates = document.querySelector("#coordinates");
coordinates.update = () => coordinates.textContent = `(${Math.round(player.x / 16) * -1}, ${Math.round(player.y / 16)})`;

// Hotbar
const hotbar = document.querySelector("#hotbar");
Object.defineProperty(Object.getPrototypeOf(hotbar),"slots",{ get: () => [...hotbar.querySelectorAll("item-slot")] });
Object.getPrototypeOf(hotbar).setSlot = index => {
  const slot = hotbar.slots[index - 1];
  slot.activate();
  player.held_item = slot.value;//console.log(`Player held item: ${player.held_item}`);
};
hotbar.addEventListener("touchstart",event => {
  event.preventDefault();
  if (event.target.closest("item-slot")) hotbar.setSlot(event.target.closest("item-slot").getAttribute("index"));
});

import "./ItemSlotElement.js";

// D-Pad
const dpad = document.querySelector("#dpad");
dpad.down = event => {
  event.preventDefault();
  if (event.target.matches("button")) event.target.setAttribute("data-active","");
  if (event.target.matches("[data-left]")) key.left = "DPadLeft";
  if (event.target.matches("[data-right]")) key.right = "DPadRight";
  if (event.target.matches("[data-up]")) key.up = "DPadUp";
  if (event.target.matches("[data-down]")) key.down = "DPadDown";
};
dpad.up = event => {
  if (event.target.matches("button")) event.target.removeAttribute("data-active");
  if (event.target.matches("[data-left]")) key.left = false;
  if (event.target.matches("[data-right]")) key.right = false;
  if (event.target.matches("[data-up]")) key.up = false;
  if (event.target.matches("[data-down]")) key.down = false;
};
dpad.addEventListener("touchstart",event => dpad.down(event));
dpad.addEventListener("touchend",event => dpad.up(event));
dpad.addEventListener("pointerdown",event => dpad.down(event));
dpad.addEventListener("pointerup",event => dpad.up(event));

// Input
/* Inconsistently implemented, app.js does not handle the gamepad and key logic, it is all used in Player.js. Ideally I would like to have user input placed located inside either app.js or it's own ES Module. */
import { key } from "./input.js";

// Game Properties
import { grassPattern } from "./properties.js";

// Environment
const explored = {
  left: 0,
  right: canvas.width,
  top: 0,
  bottom: canvas.height
};
export { explored };

// Player
import Player from "./Player.js";
const player = new Player();
export { player };

// Trees
const treesArray = [];

import Tree from "./Tree.js";

function handleTrees(){
  if (tick % 20 == 0){
    if (canvas.height / -2 - player.y - offsetX() < explored.top || canvas.height - player.y - offsetY() > explored.bottom){
      if (key.up && !key.down) treesArray.unshift(new Tree());
      if (key.down && !key.up) treesArray.push(new Tree());
    }
  }
  treesArray.forEach(tree => {
    tree.draw();
  });
}

//for (let i = 0; i < 4; i++) treesArray.push(new Tree());

// Rendering
function animate({ recursive = true } = {}){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = (grassPattern) ? grassPattern : "#779c43";
  ctx.beginPath();
  ctx.rect(0,0,canvas.width,canvas.height);
  if (grassPattern) ctx.setTransform(1,0,0,1,offsetX() + player.x,offsetY() + player.y);
  ctx.fill();
  ctx.setTransform(1,0,0,1,0,0);
  handleTrees();
  player.update();
  player.draw();
  coordinates.update();
  tick++;
  if (recursive) window.requestAnimationFrame(animate);
}
animate();