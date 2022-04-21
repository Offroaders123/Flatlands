// ES Module Imports
import Flatlands from "./Flatlands.js";

// Service Worker
Flatlands.serviceWorker.register();

// Touch Handling

/* This is to allow for :active styling on iOS Safari */
document.body.setAttribute("ontouchstart","");

if (Flatlands.environment.touchDevice) Flatlands.appearance.touch = true;

// Canvas
import { canvas, ctx, scaling, offsetX, offsetY } from "./canvas.js";

new ResizeObserver(() => {
  const { offsetWidth: width, offsetHeight: height } = canvas;
  canvas.width = width / scaling;
  canvas.height = height / scaling;
  ctx.imageSmoothingEnabled = false;
  draw();
}).observe(canvas);

let tick = 0;

export { tick };

// HUD
const hud = document.querySelector("#hud");

// Debug
const debug_toggle = document.querySelector("#debug_toggle");
export { debug_toggle };
const debug = document.querySelector("#debug");
debug.update = () => debug.textContent =
`Flatlands v${Flatlands.version}
Time Origin: ${timeOrigin}
Current Time: ${new Date().toLocaleTimeString()}
Game Time: ${Math.floor((Date.now() - timeOrigin) / 1000)}s
Ticks: ${tick}
Frames: ${Flatlands.debug.frames}
Dropped Frames: ${Flatlands.debug.droppedFrames}
Frame Delta: ${Math.floor(delta).toString().padStart(2,"0")}`;

// Coordinates
const coordinates = document.querySelector("#coordinates");
coordinates.update = () => coordinates.textContent = `(${Math.round(player.x / 16) * -1}, ${Math.round(player.y / 16)})`;

// Hotbar
const hotbar = document.querySelector("#hotbar");

// Define hotbar getters, methods, and event listeners
Object.defineProperty(Object.getPrototypeOf(hotbar),"slots",{ get: () => [...hotbar.querySelectorAll("item-slot")] });
Object.getPrototypeOf(hotbar).setSlot = index => {
  const slot = hotbar.slots[index];
  slot.activate();
  player.hotbar.active = index;
};
hotbar.addEventListener("touchstart",event => {
  event.preventDefault();
  if (event.target.closest("item-slot")) hotbar.setSlot(event.target.closest("item-slot").getAttribute("index"));
},{ passive: false });

import "./ItemSlotElement.js";

// D-Pad
import "./DPadElement.js";

// Input
/* Inconsistently implemented, app.js does not handle the gamepad and key logic, it is all used in Player.js. Ideally I would like to have user input placed located inside either app.js or it's own ES Module. */
import { key } from "./input.js";

// Game Properties
import { terrain } from "./properties.js";

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

// Loop over each hotbar slot and update it's state to match the player's state
hotbar.slots.forEach((slot,i) => slot.value = player.hotbar.slots[i]);
hotbar.slots[player.hotbar.active].activate();

export { player };

// Trees
const treesArray = [];
export { treesArray };

import Tree from "./Tree.js";

function handleTrees(){
  if (tick % 20 === 0){
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

// Update Game State
function update(){
  player.update();
  tick++;
}

// Draw Game State to the renderer
function draw(){
  const { width, height } = canvas;

  // Reset for next frame
  ctx.clearRect(0,0,width,height);

  // Draw Grass
  ctx.fillStyle = terrain.ground.texture.pattern;
  // ctx.fillStyle = "#779c43";
  ctx.beginPath();
  ctx.rect(0,0,width,height);
  ctx.setTransform(1,0,0,1,offsetX() + player.x,offsetY() + player.y);
  ctx.fill();

  // Draw Trees
  ctx.setTransform(1,0,0,1,0,0);
  handleTrees();

  // Draw Player
  player.draw();

  // Set HUD Content
  if (debug_toggle.checked && !debug.matches(":hover")) debug.update();
  coordinates.update();
}

// Game Loop
/* Rounding the time origin because some browsers do that by default, and some don't. Thought it would make sense to ensure it is consistently an integer */
const timeOrigin = Math.round(performance.timeOrigin);
let delta = 0;
let lastFrameTime = 0;

/* Eventually it would be key to make this align with the user's display refresh rate, rather than default to 60hz */
const timestep = 1000 / 60;

window.requestAnimationFrame(loop);

function loop(){
  // Calculate the amount of time that hasn't been simulated since the last tick
  const time = Date.now() - timeOrigin;
  delta += time - lastFrameTime;
  lastFrameTime = time;

  // Update Game State
  while (delta >= timestep){
    update();
    delta -= timestep;
    if (delta > timestep) Flatlands.debug.droppedFrames++;
  }

  // Draw game state to the renderer
  draw();
  lastFrameTime = time;
  Flatlands.debug.frames++;

  // Request next render frame
  window.requestAnimationFrame(loop);
}