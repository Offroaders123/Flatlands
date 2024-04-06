/* @refresh reload */
import { render } from "solid-js/web";
import { createMemo, createSignal } from "solid-js";

import type { Accessor, Setter } from "solid-js";

import "./index.scss";

const root = document.querySelector<HTMLDivElement>("#root")!;

// state hoisting
export let player: Player | null = null;

const [getPlayerX, setPlayerX] = createSignal<number>(0);
const [getPlayerY, setPlayerY] = createSignal<number>(0);

render(() => <App getPlayerX={getPlayerX} getPlayerY={getPlayerY}/>, root);

export interface AppProps {
  getPlayerX: Accessor<number>;
  getPlayerY: Accessor<number>;
}

export function App(props: AppProps) {
  return (
    <>
      <canvas id="canvas"></canvas>
      <hud-panel>
        <input id="debug_toggle" type="checkbox" tabindex="-1"/>
        <debug-panel></debug-panel>
        <Coordinates getPlayerX={props.getPlayerX} getPlayerY={props.getPlayerY}/>
        <hotbar-panel>
          <item-slot index={0}></item-slot>
          <item-slot index={1}></item-slot>
          <item-slot index={2}></item-slot>
          <item-slot index={3}></item-slot>
          <item-slot index={4}></item-slot>
          <item-slot index={5}></item-slot>
        </hotbar-panel>
        <dpad-panel>
          <button data-left tabindex="-1"/>
          <button data-right tabindex="-1"/>
          <button data-up tabindex="-1"/>
          <button data-down tabindex="-1"/>
        </dpad-panel>
      </hud-panel>
    </>
  );
}

declare module "solid-js" {
  namespace JSX {
    interface HTMLElementTags {
      "hud-panel": HTMLAttributes<HTMLElement>;
    }
  }
}

// app.js (flat modules contained as well)

// import "./Coordinates.js";
// import "./Debug.js";
// import "./DPad.js";
// import "./Hotbar.js";
// import "./ItemSlot.js";
// import Flatlands from "./Flatlands.js";
// import { canvas, ctx, scaling, offsetX, offsetY } from "./canvas.js";
// /* Inconsistently implemented, app.js does not handle the gamepad and key logic, it is all used in Player.js. Ideally I would like to have user input placed located inside either app.js or it's own ES Module. */
// import { key } from "./input.js";
// import { terrain } from "./properties.js";
// import { Player } from "./Player.js";
// import { Tree } from "./Tree.js";

// import type { HotbarSlotIndex } from "./Hotbar.js";

// canvas.js

// import { coordinates, hotbar, hud } from "./app.js";

export const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
export const ctx = canvas.getContext("2d",{ alpha: false })!;

export let scaling = 4;

export function offsetX(): number {
  return Math.round(canvas.width / 2);
}

export function offsetY(): number {
  return Math.round((canvas.offsetHeight + coordinates.offsetHeight - hotbar.offsetHeight - parseInt(getComputedStyle(hud).paddingBottom)) / scaling / 2);
}

// Coordinates.js

// import { player } from "./app.js";

export interface CoordinatesProps {
  getPlayerX: Accessor<number>;
  getPlayerY: Accessor<number>;
}

export function Coordinates(props: CoordinatesProps){
  const displayX = createMemo<number>(() => Math.round(props.getPlayerX() / 16) * -1);
  const displayY = createMemo<number>(() => Math.round(props.getPlayerY() / 16));

  return (
    <coordinates-panel>({displayX()}, {displayY()})</coordinates-panel>
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "coordinates-panel": HTMLElement;
  }
}

declare module "solid-js" {
  namespace JSX {
    interface HTMLElementTags {
      "coordinates-panel": HTMLAttributes<HTMLElement>;
    }
  }
}

// export default Coordinates;

// Debug.js

// import Flatlands from "./Flatlands.js";
// import { timeOrigin, tick, delta } from "./app.js";

export class Debug extends HTMLElement {
  #pre = document.createElement("pre");

  constructor() {
    super();
    this.append(this.#pre);
  }

  update(): void {
    this.#pre.textContent =
`Flatlands ${Flatlands.version}
Time Origin: ${timeOrigin}
Current Time: ${new Date().toLocaleTimeString()}
Game Time: ${Math.floor((Date.now() - timeOrigin) / 1000)}s
Ticks: ${tick}
Tick Time: ${Math.floor(tick / 60)}s
Milliseconds: ${Math.floor(tick / 60 * 1000)}ms
Frames: ${Flatlands.debug.frames}
Dropped Frames: ${Flatlands.debug.droppedFrames}
Frame Delta: ${Math.floor(delta).toString().padStart(2,"0")}`;
  }
}

window.customElements.define("debug-panel",Debug);

declare global {
  interface HTMLElementTagNameMap {
    "debug-panel": Debug;
  }
}

declare module "solid-js" {
  namespace JSX {
    interface HTMLElementTags {
      "debug-panel": HTMLAttributes<Debug>;
    }
  }
}

// export default Debug;

// DPad.js

// import { key } from "./input.js";

export class DPad extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("touchstart",event => {
      this.down(event);
    },{ passive: false });
    
    this.addEventListener("touchend",event => {
      this.up(event);
    });
    
    this.addEventListener("pointerdown",event => {
      this.down(event);
    });
    
    this.addEventListener("pointerup",event => {
      this.up(event);
    });    
  }

  down(event: PointerEvent | TouchEvent): void {
    if (!(event.target instanceof HTMLElement)) return;
    event.preventDefault();
  
    if (event.target.matches("button")){
      event.target.setAttribute("data-active","");
    }
  
    if (event.target.matches("[data-left]")){
      key.left = "DPadLeft";
    }
    if (event.target.matches("[data-right]")){
      key.right = "DPadRight";
    }
    if (event.target.matches("[data-up]")){
      key.up = "DPadUp";
    }
    if (event.target.matches("[data-down]")){
      key.down = "DPadDown";
    }
  }

  up(event: PointerEvent | TouchEvent): void {
    if (!(event.target instanceof HTMLElement)) return;

    if (event.target.matches("button")){
      event.target.removeAttribute("data-active");
    }
  
    if (event.target.matches("[data-left]")){
      key.left = false;
    }
    if (event.target.matches("[data-right]")){
      key.right = false;
    }
    if (event.target.matches("[data-up]")){
      key.up = false;
    }
    if (event.target.matches("[data-down]")){
      key.down = false;
    }
  }
}

window.customElements.define("dpad-panel",DPad);

declare global {
  interface HTMLElementTagNameMap {
    "dpad-panel": DPad;
  }
}

declare module "solid-js" {
  namespace JSX {
    interface HTMLElementTags {
      "dpad-panel": HTMLAttributes<DPad>;
    }
  }
}

// export default DPad;

// Entity.js

export interface BoundingClientRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export abstract class EntityAbstract {
  x = 0;
  y = 0;

  abstract box: {
    width: number;
    height: number;
  };

  abstract texture: {
    source: string;
  };

  getBoundingClientRect(): BoundingClientRect {
    const { x, y, x: left, y: top } = this;
    const { width, height } = this.box;
    const right = x + width, bottom = y + height;
    return { left, top, right, bottom, x, y, width, height };
  }
}

// Flatlands.js

export default class Flatlands {
  static version = "v0.15.0";

  static environment = {
    get touchDevice(): boolean {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }
  }

  static appearance = {
    get touch(): boolean {
      return document.documentElement.classList.contains("touch");
    },

    set touch(value: boolean) {
      if (typeof value !== "boolean") return;
      if (Flatlands.appearance.touch === value) return;

      if (value){
        document.documentElement.classList.add("touch");
      } else {
        document.documentElement.classList.remove("touch");
      }
    }
  }

  static serviceWorker = {
    get supported(): boolean {
      return "serviceWorker" in navigator && !import.meta.env.DEV;
    },

    async register(): Promise<boolean> {
      if (!Flatlands.serviceWorker.supported) return false;

      try {
        await navigator.serviceWorker.register("service-worker.js");
        return true;
      } catch (error){
        console.error(error);
        return false;
      }
    }
  }

  static debug = {
    frames: 0,
    droppedFrames: 0
  }
}

// Hotbar.js

// import { player } from "./app.js";

// import type ItemSlot from "./ItemSlot.js";

// Future goal: Can I create this tuple from a map of the `Player["hotbar"]["slots"]` key type?
export type HotbarSlots = [ItemSlot,ItemSlot,ItemSlot,ItemSlot,ItemSlot,ItemSlot];
export type HotbarSlotIndex = Extract<keyof HotbarSlots,`${number}`> extends `${infer U extends number}` ? U : never;

export class Hotbar extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("touchstart",event => {
      if (!(event.target instanceof Element)) return;
      event.preventDefault();
      const slot = event.target.closest("item-slot");
      if (slot === null) return;
      this.setSlot(slot.index);
    },{ passive: false });
  }

  setSlot(index: HotbarSlotIndex): void {
    const slot = this.slots[index];
    slot.activate();
    player!.hotbar.active = index;
  }

  get slots(): HotbarSlots {
    return [...this.querySelectorAll("item-slot")] as HotbarSlots;
  }
}

window.customElements.define("hotbar-panel",Hotbar);

declare global {
  interface HTMLElementTagNameMap {
    "hotbar-panel": Hotbar;
  }
}

declare module "solid-js" {
  namespace JSX {
    interface HTMLElementTags {
      "hotbar-panel": HTMLAttributes<Hotbar>;
    }
  }
}

// export default Hotbar;

// input.js

// import { debug_toggle, hotbar } from "./app.js";
// import Flatlands from "./Flatlands.js";

// import type { HotbarSlotIndex } from "./Hotbar.js";

export type Key = string | boolean;

export interface KeyState {
  left: Key;
  right: Key;
  up: Key;
  down: Key;
}

export const key: KeyState = {
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
    hotbar.setSlot(Number(event.code.replace(/Digit/,"")) - 1 as HotbarSlotIndex);
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

  if (["ArrowLeft","KeyA"].includes(event.code)){
    key.left = false;
  }
  if (["ArrowRight","KeyD"].includes(event.code)){
    key.right = false;
  }
  if (["ArrowUp","KeyW"].includes(event.code)){
    key.up = false;
  }
  if (["ArrowDown","KeyS"].includes(event.code)){
    key.down = false;
  }
});

document.addEventListener("touchstart",() => {
  Flatlands.appearance.touch = true;
});

document.addEventListener("contextmenu",event => {
  event.preventDefault();
});

// ItemSlot.js

// import { hotbar } from "./app.js";
// import { item } from "./properties.js";

// import type { ItemID, UnionToIntersection } from "./properties.js";
// import type { HotbarSlotIndex } from "./Hotbar.js";

export class ItemSlot extends HTMLElement {
  #itemRender = document.createElement("item-render");

  constructor() {
    super();
    this.append(this.#itemRender);
  }

  get value(): ItemID {
    return this.getAttribute("value")! as ItemID;
  }

  set value(value: ItemID) {
    if (this.value === value) return;
    this.setAttribute("value",value);
    this.sprite = value;
  }

  get index(): HotbarSlotIndex {
    return Number(this.getAttribute("index")) as HotbarSlotIndex;
  }

  get sprite(): ItemID {
    return this.getAttribute("sprite")! as ItemID;
  }

  set sprite(id: ItemID) {
    const itemEntry = item[id];
    const { texture, animation } = itemEntry as UnionToIntersection<typeof item[typeof id]>;
    const { source, width = 16, height = 16 } = texture;
    if (this.sprite === id) return;

    this.setAttribute("sprite",id);

    if (animation){
      this.setAttribute("animate","");
      this.style.setProperty("--width",`${width}px`);
      this.style.setProperty("--height",`${height}px`);
      this.style.setProperty("--duration",`${animation.duration}ms`);
      this.style.setProperty("--keyframes",`${animation.keyframes}`);
    }

    /* Another goal would be to add functionality to use the cached image itself (the line above, or `sprite`), rather than re-fetching it again in the CSS after being added as a style in `setSlotTexture()`. *edit: Super cool idea! Add canvases for each of the item renderers, rather than just an inline element, so then it can also eventually allow for item animations :O *edit2: or just use CSS instead :) (it's already implemented now!) */
    /* It could make sense to make this a method of either the hotbar element, or the hud container once an in-game inventory is implemented. Then you could update all item slots for an item to have a certain texture *edit: Almost there! This comment used to be in `properties.js`, but now all of the slot rendering logic is part of the slot element itself :) */
    this.#itemRender.style.setProperty("background-image",`url("${source}")`);
  }

  render(): void {
    this.sprite = this.value;
  }

  activate(): void {
    for (const slot of hotbar.querySelectorAll<ItemSlot>("item-slot[active]")){
      slot.deactivate();
    }
    this.setAttribute("active","");
  }

  deactivate(): void {
    this.removeAttribute("active");
  }
}

window.customElements.define("item-slot",ItemSlot);

declare global {
  interface HTMLElementTagNameMap {
    "item-slot": ItemSlot;
  }
}

declare module "solid-js" {
  namespace JSX {
    interface HTMLElementTags {
      "item-slot": HTMLAttributes<ItemSlot> & { index: number; };
    }
  }
}

// export default ItemSlot;

// Player.js

// import { Entity } from "./Entity.js";
// import { hotbar, tick, treesArray } from "./app.js";
// import { ctx, offsetX, offsetY } from "./canvas.js";
// import { key, gamepads } from "./input.js";
// import { entity, item, loadSprite, missingTextureSprite } from "./properties.js";

// import type ItemSlot from "./ItemSlot.js";
// import type { HotbarSlotIndex } from "./Hotbar.js";
// import type { AnimatedDefinition, BaseDefinition, ItemID, ReactiveAnimation, UnionToIntersection } from "./properties.js";

export class Player extends EntityAbstract implements BaseDefinition, AnimatedDefinition {
  name = "Player";
  box = {
    width: 16,
    height: 32
  };
  texture = {
    source: "textures/entity/player/guy.png",
    image: missingTextureSprite
  };
  animation = {
    type: "reactive",
    duration: 24,
    keyframes: 2,
    columns: 4,
    tick: 0,
    frame: 0,
    column: 0
  } as ReactiveAnimation;
  direction = {
    horizontal: "right",
    vertical: false
  } as {
    horizontal: "left" | "right";
    vertical: false | "down" | "up";
  };
  hotbar = {
    slots: [
      "spearsword",
      "pickmatic",
      "hatchet",
      "spade",
      "fire",
      "pizza"
    ],
    active: 4,
    held_item: "" as ItemID
  } as {
    slots: [ItemID,ItemID,ItemID,ItemID,ItemID,ItemID];
    active: HotbarSlotIndex;
    readonly held_item: ItemID;
  };
  speed = 2;

  constructor(private setPlayerX: Setter<number>, private setPlayerY: Setter<number>) {
    super();

    // Define properties only used internally by the game that don't need to be in the source file
    this.animation.tick = 0;
    this.animation.frame = 0;
    this.animation.column = 0;

    Object.defineProperty(this.hotbar,"held_item",{ get: () => this.hotbar.slots[this.hotbar.active] });

    loadSprite(this.texture.source).then(sprite => {
      if (sprite === null) return;
      this.texture.image = sprite;
    });
  }

  getEntityOverlap(): void {
    const rect1 = this.getBoundingClientRect();
    for (const tree of treesArray){
      const rect2 = tree.getBoundingClientRect();
      const overlap =
        (-rect1.top <= rect2.bottom &&
         -rect1.bottom >= rect2.top &&
         -rect1.left <= rect2.right &&
         -rect1.right >= rect2.left);
      tree.overlapRender = overlap;
    }
  }

  update(): void {
    this.getEntityOverlap();
    // @ts-expect-error - this might be causing the gamepad crashes
    const gamepad = navigator.getGamepads()[gamepads[0]];

    let [axisX,axisY] = (gamepad) ? gamepad.axes : [null,null,null,null], [left1,right1] = (gamepad) ? [gamepad.buttons[4].value,gamepad.buttons[5].value] : [null,null];

    if (gamepad){
      key.left = (Math.round(axisX as number * 1000) < 0);
      key.right = (Math.round(axisX as number * 1000) > 0);
      key.up = (Math.round(axisY as number * 1000) < 0);
      key.down = (Math.round(axisY as number * 1000) > 0);

      let active: HotbarSlotIndex = parseInt(hotbar.querySelector<ItemSlot>("item-slot[active]")!.getAttribute("slot") as string) as HotbarSlotIndex;

      if (left1 && !right1 && tick % 10 == 0){
        hotbar.setSlot(((active - 1 > 0) ? active - 1 : 6) as HotbarSlotIndex);
      }
      if (right1 && !left1 && tick % 10 == 0){
        hotbar.setSlot(((active + 1 < 7) ? active + 1 : 1) as HotbarSlotIndex);
      }
    }

    const { left, right, up, down } = key;
    const cardinal = this.speed;

    /* Cardinals */
    if (left && !right){
      this.x += cardinal * (-axisX! || 1);
    }
    if (right && !left){
      this.x -= cardinal * (axisX! || 1);
    }
    if (up && !down){
      this.y += cardinal * (-axisY! || 1);
    }
    if (down && !up){
      this.y -= cardinal * (axisY! || 1);
    }

    if (key.left && !key.right){
      this.direction.horizontal = "left";
    }
    if (key.right && !key.left){
      this.direction.horizontal = "right";
    }

    if (key.down && !key.up && !key.left && !key.right){
      this.direction.vertical = "down";
    }
    if (key.up && !key.down && !key.left && !key.right){
      this.direction.vertical = "up";
    }
    if (!key.up && !key.down || key.left || key.right){
      this.direction.vertical = false;
    }

    if (this.direction.vertical == "down"){
      this.animation.column = 2;
    }
    if (this.direction.vertical == "up"){
      this.animation.column = 3;
    }
    if (!this.direction.vertical){
      this.animation.column = 1;
    }

    if ((key.left && !key.right) || (key.right && !key.left) || (key.up && !key.down) || (key.down && !key.up)){
      this.animation.tick++;
    } else {
      this.animation.column = 0;
      this.direction.vertical = false;
    }
    if (this.animation.tick > this.animation.duration - 1){
      this.animation.tick = 0;
      (this.animation.frame < this.animation.keyframes - 1) ? this.animation.frame++ : this.animation.frame = 0;
    }

    this.setPlayerX(this.x);
    this.setPlayerY(this.y);
  }

  draw(): void {
    let scale = 1;
    let offset = 1;
    let itemScale = 1;

    if (this.direction.horizontal === "left" && this.direction.vertical !== "up"){
      scale = -1;
    }
    if (this.direction.horizontal === "right" && this.direction.vertical === "up"){
      scale = -1;
    }
    if (this.direction.horizontal === "right" && this.direction.vertical){
      offset = 0;
    }
    if (this.direction.vertical){
      itemScale = 2/3;
    }

    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,-7,14);

    ctx.drawImage(entity.shadow.texture.image,0,0,this.box.width - 2,4);
    if (this.direction.vertical === "down"){
      this.drawCharacter(scale,offset);
      this.drawItem(scale,itemScale);
    } else {
      this.drawItem(scale,itemScale);
      this.drawCharacter(scale,offset);
    }

    ctx.setTransform(1,0,0,1,0,0);
  }

  drawItem(scale: number, itemScale: number): void {
    const definition = item[this.hotbar.held_item] as UnionToIntersection<typeof item[typeof this.hotbar.held_item]>;
    let { naturalWidth: width, naturalHeight: height } = definition.texture.image;
    if (definition.animation){
      height /= definition.animation.keyframes;
    }

    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.box.width / -2 + 1,this.box.height / -2);
    ctx.transform(1,0,0,1,10,5);

    if (definition.texture.directional !== false){
      ctx.scale(-1 * itemScale,1);
      ctx.transform(1,0,0,1,-width,height);
      ctx.rotate(Math.PI * -1 / 2);
    } else {
      ctx.transform(1,0,0,1,-1,-1);
      ctx.scale(itemScale,1);
    }

    let keyframe = 0;
    if (definition.animation){
      const current = tick / 60 * 1000;
      const { duration, keyframes } = definition.animation;
      keyframe = Math.floor((current % duration) / duration * keyframes) * height;
    }

    ctx.drawImage(definition.texture.image,0,keyframe,width,height,this.direction.vertical ? this.direction.vertical === "up" ? -2 : -1 : 0,1,width,height);
  }

  drawCharacter(_scale: number, offset: number): void {
    ctx.setTransform(this.direction.horizontal === "left" && !this.direction.vertical ? -1 : 1,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.box.width / -2 + offset,this.box.height / -2);
    ctx.drawImage(this.texture.image,this.box.width * (this.animation.column !== 0 ? this.animation.frame : 0),this.box.height * this.animation.column,this.box.width,this.box.height,0,0,this.box.width,this.box.height);
  }
}

// properties.js

// import { ctx } from "./canvas.js";

export interface BaseDefinition {
  name: string;
  texture: {
    width?: number;
    height?: number;
    source: string;
    image: HTMLImageElement;
    directional?: false;
  };
}

export interface AnimatedDefinition extends BaseDefinition {
  animation: Animation;
}

export type Animation = ReactiveAnimation | RepeatAnimation;

export interface ReactiveAnimation {
  type: "reactive";
  duration: number;
  keyframes: number;
  columns: number;
  tick: number;
  frame: number;
  column: number;
}

export interface RepeatAnimation {
  type: "repeat";
  duration: number;
  keyframes: number;
}

export interface Fire extends AnimatedDefinition {
  texture: BaseDefinition["texture"] & {
    directional: false;
  };
  animation: RepeatAnimation;
}

export interface Ground extends BaseDefinition {
  texture: BaseDefinition["texture"] & {
    pattern: CanvasPattern;
  };
}

export interface Definitions {
  entity: Entity;
  item: Item;
  terrain: Terrain;
}

export interface Entity {
  shadow: BaseDefinition;
}

export interface Item {
  fire: Fire;
  hatchet: BaseDefinition;
  pickmatic: BaseDefinition;
  pizza: BaseDefinition;
  spade: BaseDefinition;
  spearsword: BaseDefinition;
}

export type ItemID = keyof Item;

export interface Terrain {
  ground: Ground;
}

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export const missingTextureSprite = new Image();
// const missingTextureSprite = new ImageData(new Uint8ClampedArray([249,0,255,255,0,0,0,255,0,0,0,255,249,0,255,255]),2,2);
missingTextureSprite.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF+QD/AAAASf/37wAAAAxJREFUeJxjcGBoAAABRADBOnocVgAAAABJRU5ErkJggg==";

const definitions: Definitions = {
  entity: {
    // player: {
    //   name: "Player",
    //   box: {
    //     width: 16,
    //     height: 32
    //   },
    //   texture: {
    //     source: "textures/entity/player/guy.png",
    //     image: missingTextureSprite
    //   },
    //   animation: {
    //     type: "reactive",
    //     duration: 24,
    //     keyframes: 2,
    //     columns: 4,
    //     tick: 0,
    //     frame: 0,
    //     column: 0
    //   },
    //   direction: {
    //     horizontal: "right",
    //     vertical: false
    //   },
    //   hotbar: {
    //     slots: [
    //       "spearsword",
    //       "pickmatic",
    //       "hatchet",
    //       "spade",
    //       "fire",
    //       "pizza"
    //     ],
    //     active: 4
    //   },
    //   speed: 2
    // } satisfies Player,
    shadow: {
      name: "Shadow",
      texture: {
        source: "textures/entity/shadow.png",
        image: missingTextureSprite
      }
    } satisfies BaseDefinition
  } satisfies Entity,
  item: {
    fire: {
      name: "Fire",
      texture: {
        source: "textures/item/fire.png",
        image: missingTextureSprite,
        directional: false
      },
      animation: {
        type: "repeat",
        duration: 750,
        keyframes: 4
      }
    } satisfies Fire,
    hatchet: {
      name: "Hatchet",
      texture: {
        source: "textures/item/hatchet.png",
        image: missingTextureSprite
      }
    } satisfies BaseDefinition,
    pickmatic: {
      name: "Pickmatic",
      texture: {
        source: "textures/item/pickmatic.png",
        image: missingTextureSprite
      }
    } satisfies BaseDefinition,
    pizza: {
      name: "Pizza",
      texture: {
        source: "textures/item/pizza.png",
        image: missingTextureSprite,
        directional: false
      }
    } satisfies BaseDefinition,
    spade: {
      name: "Spade",
      texture: {
        source: "textures/item/spade.png",
        image: missingTextureSprite
      }
    } satisfies BaseDefinition,
    spearsword: {
      name: "Spearsword",
      texture: {
        source: "textures/item/spearsword.png",
        image: missingTextureSprite
      }
    } satisfies BaseDefinition
  } satisfies Item,
  terrain: {
    ground: {
      name: "Ground",
      texture: {
        source: "textures/terrain/ground.png",
        image: missingTextureSprite,
        pattern: {} as CanvasPattern
      }
    } satisfies Ground,
    // tree: {
    //   name: "Tree",
    //   box: {
    //     width: 96,
    //     height: 192
    //   },
    //   texture: {
    //     source: "textures/terrain/tree.png",
    //     image: missingTextureSprite
    //   }
    // } satisfies Tree
  } satisfies Terrain
};

async function loadDefinitions(definitions: Definitions): Promise<void> {
  await Promise.all<void[]>(
    (Object.values(definitions) as Definitions[keyof Definitions][])
      .map(definition => Promise.all<void>(
        Object.values(definition)
          .map(feature => loadFeature(feature))
      ))
  ) satisfies void[][];
}

async function loadFeature(feature: BaseDefinition): Promise<void> {
  const { source } = feature.texture;
  const image = await loadSprite(source);
  if (image === null) return;
  feature.texture.image = image;
}

await loadDefinitions(definitions);

definitions.terrain.ground.texture.pattern = ctx.createPattern(definitions.terrain.ground.texture.image,"repeat")!;

export const { entity, item, terrain } = definitions;

export async function loadSprite(source: string): Promise<HTMLImageElement | null> {
  return new Promise<HTMLImageElement | null>(resolve => {
    const sprite = new Image();
    sprite.addEventListener("load",() => resolve(sprite));
    sprite.addEventListener("error",() => resolve(null));
    sprite.src = source;
  });
}

// Tree.js

// import { Entity } from "./Entity.js";
// import { canvas, ctx, offsetX, offsetY } from "./canvas.js";
// import { key } from "./input.js";
// import { loadSprite, missingTextureSprite } from "./properties.js";
// import { debug_toggle, explored, player } from "./app.js";

export class Tree extends EntityAbstract {
  name = "Tree";
  box = {
    width: 96,
    height: 192
  };
  texture = {
    source: "textures/terrain/tree.png",
    image: missingTextureSprite
  };

  overlapRender: boolean = false;

  constructor() {
    super();

    this.x = Math.floor(Math.random() * canvas.width) - Math.floor(canvas.width / 2) - player!.x - 96 / 2;
    //this.y = Math.floor(Math.random() * canvas.height) - canvas.height / 2 - player!.y - 192 / 2;
    if (key.up && !key.down){
      this.y = - player!.y - offsetY() - 192;
      if (explored.top > this.y) explored.top = this.y;
    }
    if (key.down && !key.up){
      this.y = canvas.height - player!.y - offsetY();
      if (explored.bottom < this.y) explored.bottom = this.y;
    }

    loadSprite(this.texture.source).then(sprite => {
      if (sprite === null) return;
      this.texture.image = sprite;
    });
  }

  draw(): void {
    if (this.overlapRender && debug_toggle.checked){
      ctx.fillStyle = "#f00";
      ctx.fillRect(this.x + player!.x + offsetX(),this.y + player!.y + offsetY(),this.box.width,this.box.height);
    }
    ctx.drawImage(this.texture.image,this.x + player!.x + offsetX(),this.y + player!.y + offsetY(),this.box.width,this.box.height);
  }
}

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
// const dpad = document.querySelector("dpad-panel")!;

// Environment
export const explored = {
  left: 0,
  right: canvas.width,
  top: 0,
  bottom: canvas.height
};

// Player
player = new Player(setPlayerX, setPlayerY);

// Loop over each hotbar slot and update it's state to match the player's state
hotbar.slots.forEach((slot,i) => {
  slot.value = player!.hotbar.slots[i as HotbarSlotIndex];
});

hotbar.slots[player!.hotbar.active].activate();

// Trees
export const treesArray: Tree[] = [];

function handleTrees(): void {
  if (tick % 20 === 0){
    if (canvas.height / -2 - player!.y - offsetX() < explored.top || canvas.height - player!.y - offsetY() > explored.bottom){
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
function update(): void {
  player!.update();
  tick++;
}

// Draw Game State to the renderer
function draw(): void {
  const { width, height } = canvas;

  // Reset for next frame
  ctx.clearRect(0,0,width,height);

  // Draw Grass
  ctx.fillStyle = terrain.ground.texture.pattern;
  // ctx.fillStyle = "#779c43";
  ctx.beginPath();
  ctx.rect(0,0,width,height);
  ctx.setTransform(1,0,0,1,offsetX() + player!.x,offsetY() + player!.y);
  ctx.fill();

  // Draw Trees
  ctx.setTransform(1,0,0,1,0,0);
  handleTrees();

  // Draw Player
  player!.draw();

  // Set HUD Content
  if (debug_toggle.checked && !debug.matches(":hover")){
    debug.update();
  }
  // coordinates.update();
}

// Game Loop
/* Rounding the time origin because some browsers do that by default, and some don't. Thought it would make sense to ensure it is consistently an integer */
export const timeOrigin = Math.round(performance.timeOrigin);
export let delta = 0;
let lastFrameTime = 0;

/* Eventually it would be key to make this align with the user's display refresh rate, rather than default to 60hz */
const timestep = 1000 / 60;

window.requestAnimationFrame(loop);

function loop(): void {
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