// ES Module imports
import Flatlands from "./Flatlands.js";

// Service Worker
await Flatlands.serviceWorker.register();

// Touch Device
if (Flatlands.environment.touchDevice) document.documentElement.classList.add("touch-device");

// Canvas
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d",{ alpha: false });

let scaling = 4;

const offsetX = () => Math.round(canvas.width / 2);
const offsetY = () => Math.round((canvas.offsetHeight + (version.offsetHeight ? (version.offsetHeight + parseInt(window.getComputedStyle(hud).getPropertyValue("gap"))) : 0) + coordinates.offsetHeight - hotbar.offsetHeight) / scaling / 2);
/*
  The section of code above in offsetY(), having to do with window.getComputedStyle(), is a temporary fix for the new HUD overlap alignment checking feature. It is so the Flex gap is also included in the centering of player rendering, if and when the Version element is present.
  A likely fix for this in a future update will be to move the upper HUD elements into their own container, so instead that container could be used for HUD overlap checking within the game renderer.
*/

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

class ItemSlotElement extends HTMLElement {
  constructor(){
    super();
    this.defined = false;
  }
  connectedCallback(){
    if (this.defined || !this.isConnected) return;
    this.defined = true;
    this.appendChild(document.createElement("item-render"));
  }
  static get observedAttributes(){
    return ["value","sprite"];
  }
  attributeChangedCallback(attribute,current,replacement){
    if (current !== replacement) this[attribute] = replacement;
  }
  get value(){
    return this.getAttribute("value") || null;
  }
  set value(item){
    if (this.value !== item) this.setAttribute("value",item);
  }
  get sprite(){
    return this.getAttribute("sprite") || null;
  }
  set sprite(source){
    if (this.sprite === source) return;
    this.setAttribute("sprite",source);
    this.querySelector("item-render").style.setProperty("background-image",`url("${source}")`);
  }
  activate(){
    hotbar.querySelectorAll("item-slot[active]").forEach(slot => slot.deactivate());
    this.setAttribute("active","");
  }
  deactivate(){
    this.removeAttribute("active");
  }
}
window.customElements.define("item-slot",ItemSlotElement);

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

// Game Properties
const missingTextureSprite = new Image();
missingTextureSprite.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF+QD/AAAASf/37wAAAAxJREFUeJxjcGBoAAABRADBOnocVgAAAABJRU5ErkJggg==";
let entities, items, terrain, grassPattern;

(async () => {

let entitiesFile = await fetch("feature_definitions/entities.json");
entities = await entitiesFile.json();
let itemsFile = await fetch("feature_definitions/items.json");
items = await itemsFile.json();
let terrainFile = await fetch("feature_definitions/terrain.json");
terrain = await terrainFile.json();

for (let entity in entities) await loadSprite(entity,entities);
for (let item in items) await loadSprite(item,items);
for (let terraine in terrain) await loadSprite(terraine,terrain);
grassPattern = ctx.createPattern(terrain["ground"].texture.image,"repeat");

async function loadSprite(key,object){
  return new Promise((resolve) => {
    let sprite = new Image(), { source } = object[key].texture;
    sprite.addEventListener("load",event => {//console.log(`${new URL(sprite.src).pathname.split("/").pop()} %cload?`,"color: green; font-size: 125%; font-weight: bold;");
      object[key].texture.image = sprite;
      setSlotTexturesWithItem(key,source);/* Another goal would be to add functionality to use the cached image itself (the line above, or `sprite`), rather than re-fetching it again in the CSS after being added as a style in `setSlotTexture()`. *edit: Super cool idea! Add canvases for each of the item renderers, rather than just an inline element, so then it can also eventually allow for item animations :O */
      resolve();
    });
    sprite.addEventListener("error",event => {//console.log(`${new URL(sprite.src).pathname.split("/").pop()} %cERROR!`,"color: red; font-size: 125%; font-weight: bold;");
      setSlotTexturesWithItem(key,missingTextureSprite.src);
      resolve();
    });
    sprite.src = source;
    function setSlotTexturesWithItem(key,source){/* It could make sense to make this a method of either the hotbar element, or the hud container once an in-game inventory is implemented. Then you could update all item slots for an item to have a certain texture */
      hotbar.slots.filter(slot => slot.value === key).forEach(slot => slot.sprite = source);
    }
  });
}

})();

// Environment
const explored = {
  left: 0,
  right: canvas.width,
  top: 0,
  bottom: canvas.height
};

// Player
class Player {
  constructor(){
    this.x = 0;
    this.y = 0;
    this.width = 16;
    this.height = 32;
    this.speed = 2;
    this.tick = 0;
    this.ticks = 24;
    this.frame = 0;
    this.frames = 2;
    this.column = 0;
    this.columns = 4;
    this.directionX = "right";
    this.directionY = false;
    this.held_item = "hatchet";
  }
  update(){
    const gamepad = navigator.getGamepads()[gamepads[0]];
    let [axisX,axisY] = (gamepad) ? gamepad.axes : [null,null,null,null], [left1,right1] = (gamepad) ? [gamepad.buttons[4].value,gamepad.buttons[5].value] : [null,null];
    if (gamepad){
      key.left = (Math.round(axisX * 1000) < 0);
      key.right = (Math.round(axisX * 1000) > 0);
      key.up = (Math.round(axisY * 1000) < 0);
      key.down = (Math.round(axisY * 1000) > 0);
      let active = parseInt(hotbar.querySelector("item-slot[active]").getAttribute("slot"));
      if (left1 && !right1 && tick % 10 == 0) hotbar.setSlot((active - 1 > 0) ? active - 1 : 6);
      if (right1 && !left1 && tick % 10 == 0) hotbar.setSlot((active + 1 < 7) ? active + 1 : 1);
    }
    if (key.left && !key.right) this.x += this.speed * (-axisX || 1);
    if (key.right && !key.left) this.x -= this.speed * (axisX || 1);
    if (key.up && !key.down) this.y += this.speed * (-axisY || 1);
    if (key.down && !key.up) this.y -= this.speed * (axisY || 1);

    if (key.left && !key.right) this.directionX = "left";
    if (key.right && !key.left) this.directionX = "right";

    if (key.down && !key.up && !key.left && !key.right) this.directionY = "down";
    if (key.up && !key.down && !key.left && !key.right) this.directionY = "up";
    if (!key.up && !key.down || key.left || key.right) this.directionY = false;

    if (this.directionY == "down") this.column = 2;
    if (this.directionY == "up") this.column = 3;
    if (!this.directionY) this.column = 1;

    if ((key.left && !key.right) || (key.right && !key.left) || (key.up && !key.down) || (key.down && !key.up)){
      this.tick++;
    } else {
      this.column = 0;
      this.directionY = false;
    }
    if (this.tick > this.ticks - 1){
      this.tick = 0;
      (this.frame < this.frames - 1) ? this.frame++ : this.frame = 0;
    }
  }
  draw(){
    let heldItemImage = (player.held_item !== null) ? (items && items[player.held_item].texture.image) ? items[player.held_item].texture.image : undefined : null;
    let scale = 1, offset = 1, itemScale = 1;

    if (this.directionX == "left" && this.directionY != "up"){
      scale = -1;
    }
    if (this.directionX == "right" && this.directionY == "up"){
      scale = -1;
    }
    if (this.directionX == "right" && this.directionY){
      offset = 0;
    }
    if (this.directionY){
      itemScale = 2/3;
    }

    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,-7,14);
    if (entities && entities["shadow"].texture.image) ctx.drawImage(entities["shadow"].texture.image,0,0,this.width - 2,4);
    if (this.directionY == "down"){
      this.drawCharacter(scale,offset);
      this.drawItem(heldItemImage,scale,itemScale);
    } else {
      this.drawItem(heldItemImage,scale,itemScale);
      this.drawCharacter(scale,offset);
    }

    ctx.setTransform(1,0,0,1,0,0);
  }
  drawItem(itemSprite,scale,itemScale){
    if (itemSprite === null) return;
    if (!itemSprite) itemSprite = missingTextureSprite;
    const cachedSprite = (itemSprite !== missingTextureSprite);
    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.width / -2 + 1,this.height / -2);
    ctx.transform(1,0,0,1,((cachedSprite) ? itemSprite.naturalWidth : 16) * 0.625,((cachedSprite) ? itemSprite.naturalHeight : 16) * 0.3125);
    ctx.scale(-1 * itemScale,1);
    ctx.transform(1,0,0,1,-((cachedSprite) ? itemSprite.naturalWidth : 16),((cachedSprite) ? itemSprite.naturalHeight : 16));
    ctx.rotate(Math.PI * -1 / 2);
    //ctx.fillStyle = "#00ff0030";
    //ctx.fillRect((this.directionY) ? (this.directionY == "up") ? -2 : -1 : 0,1,itemSprite.naturalWidth,itemSprite.naturalHeight);
    ctx.drawImage(itemSprite,(this.directionY) ? (this.directionY == "up") ? -2 : -1 : 0,1,(cachedSprite) ? itemSprite.naturalWidth : 16,(cachedSprite) ? itemSprite.naturalHeight : 16);
  }
  drawCharacter(scale,offset){/* Mob idea name: ooogr */
    const cachedSprite = (entities && entities["player"].texture.image);
    let charSprite = (cachedSprite) ? entities["player"].texture.image : missingTextureSprite;
    ctx.setTransform((this.directionX == "left" && !this.directionY) ? -1 : 1,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.width / -2 + offset,this.height / -2);
    if ( cachedSprite) ctx.drawImage(charSprite,this.width * ((this.column != 0) ? this.frame : 0),this.height * this.column,this.width,this.height,0,0,this.width,this.height);
    if (!cachedSprite) ctx.drawImage(charSprite,0,0,this.width,this.height);
  }
}
const player = new Player();

// Trees
const treesArray = [];
class Tree {
  constructor(){
    this.x = Math.floor(Math.random() * canvas.width) - Math.floor(canvas.width / 2) - player.x - 96 / 2;
    //this.y = Math.floor(Math.random() * canvas.height) - canvas.height / 2 - player.y - 192 / 2;
    if (key.up && !key.down){
      this.y = - player.y - offsetY() - 192;
      if (explored.top > this.y) explored.top = this.y;
    }
    if (key.down && !key.up){
      this.y = canvas.height - player.y - offsetY();
      if (explored.bottom < this.y) explored.bottom = this.y;
    }
    this.width = 96;
    this.height = 192;
  }
  draw(){
    ctx.drawImage((terrain && terrain["tree"].texture.image) ? terrain["tree"].texture.image : missingTextureSprite,this.x + player.x + offsetX(),this.y + player.y + offsetY(),this.width,this.height);
  }
}
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