import "./Coordinates.js";
import "./Debug.js";
import "./DPad.js";
import "./Hotbar.js";
import "./ItemSlot.js";
import Flatlands from "./Flatlands.js";
import { canvas, ctx, scaling, offsetX, offsetY } from "./canvas.js";
/* Inconsistently implemented, app.js does not handle the gamepad and key logic, it is all used in Player.js. Ideally I would like to have user input placed located inside either app.js or it's own ES Module. */
import { key } from "./input.js";
import { terrain } from "./properties.js";
import { Player } from "./Player.js";
import { Tree } from "./Tree.js";

// Service Worker
Flatlands.serviceWorker.register();

// Touch Handling

/* This is to allow for :active styling on iOS Safari */
document.body.setAttribute("ontouchstart","");

if (Flatlands.environment.touchDevice){
  Flatlands.appearance.touch = true;
}

new ResizeObserver(() => {
  const { offsetWidth: width, offsetHeight: height } = canvas;
  canvas.width = width / scaling;
  canvas.height = height / scaling;
  ctx.imageSmoothingEnabled = false;
  draw();
}).observe(canvas);

export let tick = 0;

// HUD
export const hud = document.querySelector("hud-panel")!;

// Debug
export const debug_toggle = document.querySelector<HTMLInputElement>("#debug_toggle")!;

const debug = document.querySelector("debug-panel")!;

// Coordinates
export const coordinates = document.querySelector("coordinates-panel")!;

// Hotbar
export const hotbar = document.querySelector("hotbar-panel")!;

// D-Pad
const dpad = document.querySelector("dpad-panel")!;

// Environment
export const explored = {
  left: 0,
  right: canvas.width,
  top: 0,
  bottom: canvas.height
};

// Player
export const player = new Player();

// Loop over each hotbar slot and update it's state to match the player's state
hotbar.slots.forEach((slot,i) => {
  slot.value = player.hotbar.slots[i];
});

hotbar.slots[player.hotbar.active].activate();

// Trees
export const treesArray: Tree[] = [];

function handleTrees(){
  if (tick % 20 === 0){
    if (canvas.height / -2 - player.y - offsetX() < explored.top || canvas.height - player.y - offsetY() > explored.bottom){
      if (key.up && !key.down){
        treesArray.unshift(new Tree());
      }
      if (key.down && !key.up){
        treesArray.push(new Tree());
      }
    }
  }

  for (const tree of treesArray){
    tree.draw();
  }
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
  if (debug_toggle.checked && !debug.matches(":hover")){
    debug.update();
  }
  coordinates.update();
}

// Game Loop
/* Rounding the time origin because some browsers do that by default, and some don't. Thought it would make sense to ensure it is consistently an integer */
export const timeOrigin = Math.round(performance.timeOrigin);
export let delta = 0;
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
    if (delta > timestep){
      Flatlands.debug.droppedFrames++;
    }
  }

  // Draw game state to the renderer
  draw();
  lastFrameTime = time;
  Flatlands.debug.frames++;

  // Request next render frame
  window.requestAnimationFrame(loop);
}