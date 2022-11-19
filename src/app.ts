import { Flatlands } from "./Flatlands.js";
import { canvas, ctx, scaling, offsetX, offsetY } from "./canvas.js";
import "./ItemSlotElement.js";
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

if (Flatlands.environment.touchDevice) Flatlands.appearance.touch = true;

new ResizeObserver(() => {
  const { offsetWidth: width, offsetHeight: height } = canvas;
  canvas.width = width / scaling;
  canvas.height = height / scaling;
  ctx.imageSmoothingEnabled = false;
  draw();
}).observe(canvas);

export let tick = 0;

// HUD
const hud = document.querySelector<HTMLDivElement>("#hud")!;

// Debug
export const debug_toggle = document.querySelector<HTMLInputElement>("#debug_toggle")!;

interface Debug extends HTMLPreElement {
  update: () => void;
}

const debug = document.querySelector<HTMLPreElement>("#debug")! as Debug;
debug.update = () => debug.textContent =
`Flatlands v${Flatlands.version}
Time Origin: ${timeOrigin}
Current Time: ${new Date().toLocaleTimeString()}
Game Time: ${Math.floor((Date.now() - timeOrigin) / 1000)}s
Ticks: ${tick}
Tick Time: ${Math.floor(tick / 60)}s
Milliseconds: ${Math.floor(tick / 60 * 1000)}ms
Frames: ${Flatlands.debug.frames}
Dropped Frames: ${Flatlands.debug.droppedFrames}
Frame Delta: ${Math.floor(delta).toString().padStart(2,"0")}`;

// Coordinates
interface Coordinates extends HTMLSpanElement {
  update: () => void;
}

const coordinates = document.querySelector<HTMLSpanElement>("#coordinates")! as Coordinates;
coordinates.update = () => coordinates.textContent = `(${Math.round(player.x / 16) * -1}, ${Math.round(player.y / 16)})`;

// Hotbar
interface Hotbar extends HTMLDivElement {
  readonly setSlot: (index: number) => void;
  readonly slots: ItemSlotElement[];
}

const hotbar = document.querySelector<HTMLDivElement>("#hotbar")! as Hotbar;

// Define hotbar getters, methods, and event listeners
Object.defineProperty(Object.getPrototypeOf(hotbar),"slots",{ get: () => [...hotbar.querySelectorAll("item-slot")] });
Object.getPrototypeOf(hotbar).setSlot = (index: number) => {
  const slot = hotbar.slots[index];
  slot.activate();
  player.hotbar.active = index;
};
hotbar.addEventListener("touchstart",event => {
  event.preventDefault();
  if ((event.target as Element).closest("item-slot")) hotbar.setSlot((event.target as Element).closest("item-slot")!.getAttribute("index") as number);
},{ passive: false });

// D-Pad
interface DPad extends HTMLDivElement {
  down: (event: Event) => void;
  up: (event: Event) => void;
}

const dpad = document.querySelector<HTMLDivElement>("#dpad")! as DPad;
dpad.down = event => {
  event.preventDefault();
  if ((event.target as Element).matches("button")) (event.target as Element).setAttribute("data-active","");
  if ((event.target as Element).matches("[data-left]")) key.left = "DPadLeft";
  if ((event.target as Element).matches("[data-right]")) key.right = "DPadRight";
  if ((event.target as Element).matches("[data-up]")) key.up = "DPadUp";
  if ((event.target as Element).matches("[data-down]")) key.down = "DPadDown";
};
dpad.up = event => {
  if ((event.target as Element).matches("button")) (event.target as Element).removeAttribute("data-active");
  if ((event.target as Element).matches("[data-left]")) key.left = false;
  if ((event.target as Element).matches("[data-right]")) key.right = false;
  if ((event.target as Element).matches("[data-up]")) key.up = false;
  if ((event.target as Element).matches("[data-down]")) key.down = false;
};
dpad.addEventListener("touchstart",event => dpad.down(event),{ passive: false });
dpad.addEventListener("touchend",event => dpad.up(event));
dpad.addEventListener("pointerdown",event => dpad.down(event));
dpad.addEventListener("pointerup",event => dpad.up(event));

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
hotbar.slots.forEach((slot,i) => slot.value = player.hotbar.slots[i]);
hotbar.slots[player.hotbar.active].activate();

// Trees
export const treesArray: Tree[] = [];

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