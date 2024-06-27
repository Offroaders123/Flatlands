/* @refresh reload */
import { render } from "solid-js/web";
import { Show, createEffect, createMemo, createSignal, on, onCleanup, onMount } from "solid-js";
import playerTexture from "/textures/entity/player/guy.png";
import shadowTexture from "/textures/entity/shadow.png";
import fireTexture from "/textures/item/fire.png";
import hatchetTexture from "/textures/item/hatchet.png";
import pickmaticTexture from "/textures/item/pickmatic.png";
import pizzaTexture from "/textures/item/pizza.png";
import spadeTexture from "/textures/item/spade.png";
import spearswordTexture from "/textures/item/spearsword.png";
import groundTexture from "/textures/terrain/ground.png";
import treeTexture from "/textures/terrain/tree.png";

import type { Accessor, Setter } from "solid-js";

import "./index.scss";

const root = document.querySelector<HTMLDivElement>("#root")!;

const isTouchDevice: boolean = "ontouchstart" in window || navigator.maxTouchPoints > 0;

// properties.js

// import { ctx } from "./canvas.js";

export interface BaseDefinition {
  name: string;
  texture: {
    width?: number;
    height?: number;
    source: string;
    image?: HTMLImageElement;
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
    pattern: CanvasPattern | null;
  };
}

export interface Definitions {
  entity: Entity;
  item: Item;
  terrain: Terrain;
}

export interface Entity {
  player: BaseDefinition;
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
  tree: BaseDefinition;
}

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export const missingTextureSprite = new Image();
// const missingTextureSprite = new ImageData(new Uint8ClampedArray([249,0,255,255,0,0,0,255,0,0,0,255,249,0,255,255]),2,2);
missingTextureSprite.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAlwSFlz\
AAALEwAACxMBAJqcGAAAAAZQTFRF+QD/AAAASf/37wAAAAxJREFUeJxjcGBoAAABRADBOnocVgAAAABJRU5ErkJggg==`;

const definitions: Definitions = {
  entity: {
    player: {
      name: "Player",
      texture: {
        source: playerTexture
      }
    } satisfies BaseDefinition,
    shadow: {
      name: "Shadow",
      texture: {
        source: shadowTexture
      }
    } satisfies BaseDefinition
  } satisfies Entity,
  item: {
    fire: {
      name: "Fire",
      texture: {
        source: fireTexture,
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
        source: hatchetTexture
      }
    } satisfies BaseDefinition,
    pickmatic: {
      name: "Pickmatic",
      texture: {
        source: pickmaticTexture
      }
    } satisfies BaseDefinition,
    pizza: {
      name: "Pizza",
      texture: {
        source: pizzaTexture,
        directional: false
      }
    } satisfies BaseDefinition,
    spade: {
      name: "Spade",
      texture: {
        source: spadeTexture
      }
    } satisfies BaseDefinition,
    spearsword: {
      name: "Spearsword",
      texture: {
        source: spearswordTexture
      }
    } satisfies BaseDefinition
  } satisfies Item,
  terrain: {
    ground: {
      name: "Ground",
      texture: {
        source: groundTexture,
        pattern: null // ctx.createPattern(missingTextureSprite, "repeat")!
      }
    } satisfies Ground,
    tree: {
      name: "Tree",
      texture: {
        source: treeTexture
      }
    } satisfies BaseDefinition
  } satisfies Terrain
};

async function loadDefinitions(definitions: Definitions, ctx: CanvasRenderingContext2D): Promise<void> {
  await Promise.all<void[]>(
    (Object.values(definitions) as Definitions[keyof Definitions][])
      .map(definition => Promise.all<void>(
        Object.values(definition)
          .map(feature => loadFeature(feature, ctx))
      ))
  ) satisfies void[][];
}

async function loadFeature(feature: BaseDefinition, ctx: CanvasRenderingContext2D): Promise<void> {
  const { source } = feature.texture;
  const image = await loadSprite(source);
  if (image === null) return;
  feature.texture.image = image;
  if (feature.name !== "Ground") return;
  if (ctx === undefined) return;
  (feature as Ground).texture.pattern = ctx.createPattern(image, "repeat")!;
}

// await loadDefinitions(definitions, ctx);

export const { entity, item, terrain } = definitions;
// item = definitions.item;

export async function loadSprite(source: string): Promise<HTMLImageElement | null> {
  return new Promise<HTMLImageElement | null>(resolve => {
    const sprite = new Image();
    sprite.addEventListener("load",() => resolve(sprite));
    sprite.addEventListener("error",() => resolve(null));
    sprite.src = source;
  });
}

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
    image?: HTMLImageElement;
  };

  getBoundingClientRect(): BoundingClientRect {
    const { x, y, x: left, y: top } = this;
    const { width, height } = this.box;
    const right = x + width, bottom = y + height;
    return { left, top, right, bottom, x, y, width, height };
  }
}

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
  texture = entity.player.texture;
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
    held_item: null
  } as {
    slots: [ItemID | null, ItemID | null, ItemID | null, ItemID | null, ItemID | null, ItemID | null];
    active: HotbarSlotIndex;
    readonly held_item: ItemID | null;
  };
  speed = 2;

  constructor(private readonly getSlot: Accessor<HotbarSlotIndex>, private readonly setSlot: Setter<HotbarSlotIndex>, private readonly treesArray: Tree[], private readonly offsetX: () => number, private readonly offsetY: () => number, private readonly key: KeyState, private readonly gamepads: number[], private readonly ctx: CanvasRenderingContext2D, private readonly getTick: Accessor<number>) {
    super();

    // Define properties only used internally by the game that don't need to be in the source file
    this.animation.tick = 0;
    this.animation.frame = 0;
    this.animation.column = 0;

    Object.defineProperty(this.hotbar,"held_item",{ get: () => this.hotbar.slots[this.hotbar.active] });
  }

  getEntityOverlap(): void {
    const rect1 = this.getBoundingClientRect();
    for (const tree of this.treesArray){
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
    //// @ts-expect-error - this might be causing the gamepad crashes
    const gamepad = navigator.getGamepads()[this.gamepads[0]!];

    let [axisX,axisY] = (gamepad) ? gamepad.axes : [null,null,null,null];
    let [left1,right1] = (gamepad) ? [gamepad.buttons[4]!.value,gamepad.buttons[5]!.value] : [null,null];

    if (gamepad){
      this.key.left = (Math.round(axisX as number * 1000) < 0);
      this.key.right = (Math.round(axisX as number * 1000) > 0);
      this.key.up = (Math.round(axisY as number * 1000) < 0);
      this.key.down = (Math.round(axisY as number * 1000) > 0);

      let active: HotbarSlotIndex = this.getSlot();

      if (left1 && !right1 && this.getTick() % 10 == 0){
        const previous: HotbarSlotIndex = active === 0 ? 5 : active - 1 as HotbarSlotIndex;
        this.setSlot(previous);
      }
      if (right1 && !left1 && this.getTick() % 10 == 0){
        const next: HotbarSlotIndex = active === 5 ? 0 : active + 1 as HotbarSlotIndex;
        this.setSlot(next);
      }
    }

    const { left, right, up, down } = this.key;
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

    if (this.key.left && !this.key.right){
      this.direction.horizontal = "left";
    }
    if (this.key.right && !this.key.left){
      this.direction.horizontal = "right";
    }

    if (this.key.down && !this.key.up && !this.key.left && !this.key.right){
      this.direction.vertical = "down";
    }
    if (this.key.up && !this.key.down && !this.key.left && !this.key.right){
      this.direction.vertical = "up";
    }
    if (!this.key.up && !this.key.down || this.key.left || this.key.right){
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

    if ((this.key.left && !this.key.right) || (this.key.right && !this.key.left) || (this.key.up && !this.key.down) || (this.key.down && !this.key.up)){
      this.animation.tick++;
    } else {
      this.animation.column = 0;
      this.direction.vertical = false;
    }
    if (this.animation.tick > this.animation.duration - 1){
      this.animation.tick = 0;
      (this.animation.frame < this.animation.keyframes - 1) ? this.animation.frame++ : this.animation.frame = 0;
    }
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

    this.ctx.setTransform(scale,0,0,1,this.offsetX(),this.offsetY());
    this.ctx.transform(1,0,0,1,-7,14);

    this.ctx.drawImage(entity.shadow.texture.image ?? missingTextureSprite,0,0,this.box.width - 2,4);
    if (this.direction.vertical === "down"){
      this.drawCharacter(scale,offset);
      this.drawItem(scale,itemScale);
    } else {
      this.drawItem(scale,itemScale);
      this.drawCharacter(scale,offset);
    }

    this.ctx.setTransform(1,0,0,1,0,0);
  }

  drawItem(scale: number, itemScale: number): void {
    if (this.hotbar.held_item === null) return;
    const definition = item![this.hotbar.held_item] as UnionToIntersection<NonNullable<typeof item>[typeof this.hotbar.held_item]>;
    let { naturalWidth: width, naturalHeight: height } = definition.texture.image ?? missingTextureSprite;
    if (definition.animation){
      height /= definition.animation.keyframes;
    }

    this.ctx.setTransform(scale,0,0,1,this.offsetX(),this.offsetY());
    this.ctx.transform(1,0,0,1,this.box.width / -2 + 1,this.box.height / -2);
    this.ctx.transform(1,0,0,1,10,5);

    if (definition.texture.directional !== false){
      this.ctx.scale(-1 * itemScale,1);
      this.ctx.transform(1,0,0,1,-width,height);
      this.ctx.rotate(Math.PI * -1 / 2);
    } else {
      this.ctx.transform(1,0,0,1,-1,-1);
      this.ctx.scale(itemScale,1);
    }

    let keyframe = 0;
    if (definition.animation){
      const current = this.getTick() / 60 * 1000;
      const { duration, keyframes } = definition.animation;
      keyframe = Math.floor((current % duration) / duration * keyframes) * height;
    }

    this.ctx.drawImage(
      definition.texture.image ?? missingTextureSprite,
      0,
      keyframe,
      width,
      height,
      this.direction.vertical ? this.direction.vertical === "up" ? -2 : -1 : 0,
      1,
      width,
      height
    );
  }

  drawCharacter(_scale: number, offset: number): void {
    this.ctx.setTransform(this.direction.horizontal === "left" && !this.direction.vertical ? -1 : 1,0,0,1,this.offsetX(),this.offsetY());
    this.ctx.transform(1,0,0,1,this.box.width / -2 + offset,this.box.height / -2);
    this.ctx.drawImage(
      this.texture.image ?? missingTextureSprite,
      this.box.width * (this.animation.column !== 0 ? this.animation.frame : 0),
      this.box.height * this.animation.column,
      this.box.width,
      this.box.height,
      0,
      0,
      this.box.width,
      this.box.height
    );
  }
}

render(() => <App/>, root);

// export const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
// ctx = canvas!.getContext("2d",{ alpha: false })!;

export function App() {
  // state hoisting
  // export let player: Player | null = null;
  // export let item: Item | null = null;

  let hud: HTMLDivElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D;

  // HUD
  // export const hud = document.querySelector<HTMLDivElement>(".hud-panel")!;

  // Debug
  // export const debug_toggle = document.querySelector<HTMLInputElement>("#debug_toggle")!;

  // let debug: HTMLDivElement | null = null;
  // const debug = document.querySelector<HTMLDivElement>(".debug-panel")!;

  // Coordinates
  let coordinates: HTMLDivElement | null = null;
  // export const coordinates = document.querySelector<HTMLDivElement>(".coordinates-panel")!;

  // Hotbar
  let hotbar: HTMLDivElement | null = null;
  // export const hotbar = document.querySelector<HTMLDivElement>(".hotbar-panel")!;

  // D-Pad
  // const dpad = document.querySelector<HTMLDivElement>(".dpad-panel")!;

  const [getTouchEnabled, setTouchEnabled] = createSignal<boolean>(false);
  const [getDebugEnabled, setDebugEnabled] = createSignal<boolean>(false);

  const [getPlayerX, setPlayerX] = createSignal<number>(0);
  const [getPlayerY, setPlayerY] = createSignal<number>(0);

  const [getVersion, setVersion] = createSignal<string>(`${null}`);
  const [getTimeOrigin, setTimeOrigin] = createSignal<number>(0);
  const [getTick, setTick] = createSignal<number>(0);
  const [getFrames, setFrames] = createSignal<number>(0);
  const [getDroppedFrames, setDroppedFrames] = createSignal<number>(0);
  const [getDelta, setDelta] = createSignal<number>(0);

  let player: Player;
  let debug: HTMLDivElement;

  const key: KeyState = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  const gamepads: number[] = [];

  const [getSlot, setSlot] = createSignal<HotbarSlotIndex>(0);
  const [getSlot0, setSlot0] = createSignal<ItemID | null>(null);
  const [getSlot1, setSlot1] = createSignal<ItemID | null>(null);
  const [getSlot2, setSlot2] = createSignal<ItemID | null>(null);
  const [getSlot3, setSlot3] = createSignal<ItemID | null>(null);
  const [getSlot4, setSlot4] = createSignal<ItemID | null>(null);
  const [getSlot5, setSlot5] = createSignal<ItemID | null>(null);
  
  onMount(() => {
    setVersion(version);

    ctx = canvas!.getContext("2d",{ alpha: false })!;
    loadDefinitions(definitions, ctx);

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
      setTouchEnabled(false);

      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.shiftKey && event.code === "KeyD"){
        event.preventDefault();
        setDebugEnabled(previous => !previous);
        // debug_toggle.click();
      }

      if (event.shiftKey && event.code === "KeyF"){
        event.preventDefault();
        if (document.webkitFullscreenEnabled && !document.fullscreenEnabled){
          (!document.webkitFullscreenElement) ? document.documentElement.webkitRequestFullscreen() : document.webkitExitFullscreen();
        }
        if (document.fullscreenEnabled){
          (!document.fullscreenElement) ? document.documentElement.requestFullscreen() : document.exitFullscreen();
        }
      }

      if (event.shiftKey) return;

      if (["Digit1","Digit2","Digit3","Digit4","Digit5","Digit6"].includes(event.code)){
        event.preventDefault();
        setSlot(Number(event.code.replace(/Digit/,"")) - 1 as HotbarSlotIndex);
      }

      if (["ArrowLeft" as const, "KeyA" as const].includes(event.code)){
        event.preventDefault();
        key.left = event.code;
      }
      if (["ArrowRight" as const, "KeyD" as const].includes(event.code)){
        event.preventDefault();
        key.right = event.code;
      }
      if (["ArrowUp" as const, "KeyW" as const].includes(event.code)){
        event.preventDefault();
        key.up = event.code;
      }
      if (["ArrowDown" as const, "KeyS" as const].includes(event.code)){
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
      setTouchEnabled(true);
    });

    document.addEventListener("contextmenu",event => {
      event.preventDefault();
    });

    if (isTouchDevice){
      setTouchEnabled(true);
    }

    new ResizeObserver(() => {
      const { offsetWidth: width, offsetHeight: height } = canvas!;
      canvas!.width = width / scaling;
      canvas!.height = height / scaling;
      ctx.imageSmoothingEnabled = false;
      draw();
    }).observe(canvas!);

    // export let tick = 0;

    // Environment
    const explored = {
      left: 0,
      right: canvas!.width,
      top: 0,
      bottom: canvas!.height
    };

    // Trees
    const treesArray: Tree[] = [];

    function handleTrees(): void {
      if (getTick() % 20 === 0){
        if (canvas!.height / -2 - player!.y - offsetX() < explored.top || canvas!.height - player!.y - offsetY() > explored.bottom){
          if (key.up && !key.down){
            treesArray.unshift(new Tree(player, explored, offsetX, offsetY, key, canvas!, ctx, getDebugEnabled));
          }
          if (key.down && !key.up){
            treesArray.push(new Tree(player, explored, offsetX, offsetY, key, canvas!, ctx, getDebugEnabled));
          }
        }
      }

      for (const tree of treesArray){
        tree.draw();
      }
    }

    //for (let i = 0; i < 4; i++) treesArray.push(new Tree());

    // Player
    player = new Player(getSlot, setSlot, treesArray, offsetX, offsetY, key, gamepads, ctx, getTick);

    setSlot0(player.hotbar.slots[0]);
    setSlot1(player.hotbar.slots[1]);
    setSlot2(player.hotbar.slots[2]);
    setSlot3(player.hotbar.slots[3]);
    setSlot4(player.hotbar.slots[4]);
    setSlot5(player.hotbar.slots[5]);

    setSlot(player.hotbar.active);

    // // Loop over each hotbar slot and update it's state to match the player's state
    // slots().forEach((slot,i) => {
    //   slot.value = player!.hotbar.slots[i as HotbarSlotIndex];
    // });

    // slots()[player!.hotbar.active].activate();

    terrain.ground.texture.pattern = ctx.createPattern(missingTextureSprite, "repeat")!;
    loadFeature(terrain.ground, ctx);
    // terrain.ground.texture.pattern = ctx.createPattern(image, "repeat")!;

    // canvas.js

    // import { coordinates, hotbar, hud } from "./app.js";

    let scaling = 4;

    function offsetX(): number {
      return Math.round(canvas!.width / 2);
    }

    function offsetY(): number {
      return Math.round(
        (canvas!.offsetHeight + (coordinates?.offsetHeight ?? 0) - (hotbar?.offsetHeight ?? 0) - (hud !== null ? parseInt(getComputedStyle(hud).paddingBottom) : 0))
        / scaling / 2
      );
    }

    // Update Game State
    function update(): void {
      player!.update();
      // tick++;
      setTick(previous => previous += 1);
    }

    // Draw Game State to the renderer
    function draw(): void {
      const { width, height } = canvas!;

      // Reset for next frame
      ctx.clearRect(0,0,width,height);

      // Draw Grass
      ctx.fillStyle = terrain.ground.texture.pattern!;
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
      if (getDebugEnabled() && !debug!.matches(":hover")){
        // debug.update();
        setTimeOrigin(timeOrigin);
        setTick(getTick);
        // setFrames(Flatlands.debug.frames);
        // setDroppedFrames(Flatlands.debug.droppedFrames);
        setDelta(delta);
      }
      // coordinates.update();
      setPlayerX(player!.x);
      setPlayerY(player!.y);
    }

    // Game Loop
    /*
      Rounding the time origin because some browsers do that by default, and some don't.
      Thought it would make sense to ensure it is consistently an integer
    */
    const timeOrigin = Math.round(performance.timeOrigin);
    let delta = 0;
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
          setDroppedFrames(previous => previous + 1);
        }
      }

      // Draw game state to the renderer
      draw();
      lastFrameTime = time;
      setFrames(previous => previous + 1);

      // Request next render frame
      window.requestAnimationFrame(loop);
    }
  });

  createEffect(() => {
    const touchEnabled: boolean = getTouchEnabled();
    if (touchEnabled){
      document.documentElement.classList.add("touch");
    } else {
      document.documentElement.classList.remove("touch");
    }
  });

  createEffect(() => {
    const slot = getSlot();
    if (player === null) return;
    player.hotbar.active = slot;
  });

  // createEffect(() => {
  //   console.log(canvas);
  //   console.log(hud);
  //   console.log(coordinates);
  //   console.log(hotbar);
  // });

  return (
    <>
      <canvas id="canvas" ref={ref => canvas = ref}/>
      <div class="hud-panel" ref={ref => hud = ref}>
        <input
          id="debug_toggle"
          type="checkbox"
          tabindex="-1"
          checked={getDebugEnabled()}
          oninput={event => setDebugEnabled(event.currentTarget.checked)}
        />
        <Show when={getDebugEnabled()}>
        <Debug
          version={getVersion()}
          timeOrigin={getTimeOrigin()}
          getTick={getTick}
          getFrames={getFrames}
          getDroppedFrames={getDroppedFrames}
          getDelta={getDelta}
          ref={ref => debug = ref}
        />
        </Show>
        <Coordinates
          getPlayerX={getPlayerX}
          getPlayerY={getPlayerY}
          ref={ref => coordinates = ref}
        />
        <Hotbar
          getSlot={getSlot}
          getActive={getSlot}
          setActive={setSlot}
          getSlot0={getSlot0}
          getSlot1={getSlot1}
          getSlot2={getSlot2}
          getSlot3={getSlot3}
          getSlot4={getSlot4}
          getSlot5={getSlot5}
          ref={ref => hotbar = ref}
        />
        <DPad
          key={key}
        />
      </div>
    </>
  );
}

// app.js (flat modules contained as well)

// import "./Coordinates.js";
// import "./Debug.js";
// import "./DPad.js";
// import "./Hotbar.js";
// import "./ItemSlot.js";
// import Flatlands from "./Flatlands.js";
// import { canvas, ctx, scaling, offsetX, offsetY } from "./canvas.js";
// /*
//   Inconsistently implemented, app.js does not handle the gamepad and key logic, it is all used in Player.js.
//   Ideally I would like to have user input placed located inside either app.js or it's own ES Module.
// */
// import { key } from "./input.js";
// import { terrain } from "./properties.js";
// import { Player } from "./Player.js";
// import { Tree } from "./Tree.js";

// import type { HotbarSlotIndex } from "./Hotbar.js";

// Coordinates.js

// import { player } from "./app.js";

export interface CoordinatesProps {
  getPlayerX: Accessor<number>;
  getPlayerY: Accessor<number>;
  ref(value: HTMLDivElement): void;
}

export function Coordinates(props: CoordinatesProps) {
  const displayX = createMemo<number>(() => Math.round(props.getPlayerX() / 16) * -1);
  const displayY = createMemo<number>(() => Math.round(props.getPlayerY() / 16));

  return (
    <div class="coordinates-panel" ref={props.ref}>({displayX()}, {displayY()})</div>
  );
}

// export default Coordinates;

// Debug.js

// import Flatlands from "./Flatlands.js";
// import { timeOrigin, tick, delta } from "./app.js";

export interface DebugProps {
  version: string;
  timeOrigin: number;
  getTick: Accessor<number>;
  getFrames: Accessor<number>;
  getDroppedFrames: Accessor<number>;
  getDelta: Accessor<number>;
  ref(ref: HTMLDivElement): void;
}

export function Debug(props: DebugProps) {
  const getCurrentTime = createMemo<string>(on(props.getTick, () => new Date().toLocaleTimeString()));
  const getGameTime = createMemo<number>(on(props.getTick, () => Math.floor((Date.now() - props.timeOrigin) / 1000)));
  const getTickTime = createMemo<number>(() => Math.floor(props.getTick() / 60));
  const getMilliseconds = createMemo<number>(() => Math.floor(props.getTick() / 60 * 1000));
  const getFrameDelta = createMemo<string>(() => Math.floor(props.getDelta()).toString().padStart(2,"0"));

  return (
    <div class="debug-panel" ref={props.ref}>
      <pre>
        Flatlands v{props.version}{"\n"}
        Time Origin: {props.timeOrigin}{"\n"}
        Current Time: {getCurrentTime()}{"\n"}
        Game Time: {getGameTime()}s{"\n"}
        Ticks: {props.getTick()}{"\n"}
        Tick Time: {getTickTime()}s{"\n"}
        Milliseconds: {getMilliseconds()}ms{"\n"}
        Frames: {props.getFrames()}{"\n"}
        Dropped Frames: {props.getDroppedFrames()}{"\n"}
        Frame Delta: {getFrameDelta()}{"\n"}
      </pre>
    </div>
  );
}

// export default Debug;

// DPad.js

// import { key } from "./input.js";

export interface DPadProps {
  key: KeyState;
}

export function DPad(props: DPadProps) {
  let ref: HTMLDivElement;
  const cleanup = new AbortController();

  createEffect(() => {
    ref.addEventListener("touchstart", event => dPadDown(event, props.key), { signal: cleanup.signal, passive: false });
    ref.addEventListener("touchend", event => dPadUp(event, props.key), { signal: cleanup.signal });
    ref.addEventListener("pointerdown", event => dPadDown(event, props.key), { signal: cleanup.signal });
    ref.addEventListener("pointerup", event => dPadUp(event, props.key), { signal: cleanup.signal });
  });

  onCleanup(() => cleanup.abort());

  return (
    <div class="dpad-panel" ref={ref!}>
      <button data-left tabindex={-1}/>
      <button data-right tabindex={-1}/>
      <button data-up tabindex={-1}/>
      <button data-down tabindex={-1}/>
    </div>
  );
}

  function dPadDown(event: PointerEvent | TouchEvent, key: KeyState): void {
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

  function dPadUp(event: PointerEvent | TouchEvent, key: KeyState): void {
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

// export default DPad;

// Flatlands.js

import { version } from "../package.json";

// Hotbar.js

// import { player } from "./app.js";

// import type ItemSlot from "./ItemSlot.js";

//// Future goal: Can I create this tuple from a map of the `Player["hotbar"]["slots"]` key type?
// export type HotbarSlots = [ItemSlot,ItemSlot,ItemSlot,ItemSlot,ItemSlot,ItemSlot];
export type HotbarSlotIndex = Extract<keyof Player["hotbar"]["slots"],`${number}`> extends `${infer U extends number}` ? U : never;

export interface HotbarProps {
  getSlot: Accessor<HotbarSlotIndex>;
  getActive: Accessor<HotbarSlotIndex>;
  setActive: Setter<HotbarSlotIndex>;
  getSlot0: Accessor<ItemID | null>;
  getSlot1: Accessor<ItemID | null>;
  getSlot2: Accessor<ItemID | null>;
  getSlot3: Accessor<ItemID | null>;
  getSlot4: Accessor<ItemID | null>;
  getSlot5: Accessor<ItemID | null>;
  ref(value: HTMLDivElement): void;
}

export function Hotbar(props: HotbarProps) {
  let ref: HTMLDivElement;
  const cleanup = new AbortController();

  createEffect(() => {
    ref.addEventListener("touchstart",event => {
      if (!(event.target instanceof Element)) return;
      event.preventDefault();
      const slot = event.target.closest<HTMLDivElement>(".item-slot");
      if (slot === null) return;
      const index: HotbarSlotIndex = Number(slot.getAttribute("data-index")!) as HotbarSlotIndex;
      props.setActive(index);
    },{ signal: cleanup.signal, passive: false });
  });

  onCleanup(() => cleanup.abort());

  return (
    <div class="hotbar-panel" ref={refe => { props.ref(refe); ref = refe; }}>
      {
        Array.from({ length: 6 }).map((_, i) => {
          const index = i as HotbarSlotIndex;
          const isActive = createMemo(() => props.getActive() === index);
          return (
            <ItemSlot
              value={props[`getSlot${index}`]}
              index={index}
              active={isActive}
              getSlot={props.getSlot}
            />
          );
        })
      }
    </div>
  );
}

  // function setSlot(index: HotbarSlotIndex): void {
  //   const slot = slots()[index];
  //   slot.activate();
  //   player!.hotbar.active = index;
  // }

  // function slots(): HotbarSlots {
  //   return [...hotbar.querySelectorAll("item-slot")] as HotbarSlots;
  // }

// export default Hotbar;

// input.js

// import { debug_toggle, hotbar } from "./app.js";
// import Flatlands from "./Flatlands.js";

// import type { HotbarSlotIndex } from "./Hotbar.js";

export type KeyLeft = boolean | "ArrowLeft" | "KeyA" | "DPadLeft";
export type KeyRight = boolean | "ArrowRight" | "KeyD" | "DPadRight";
export type KeyUp = boolean | "ArrowUp" | "KeyW" | "DPadUp";
export type KeyDown = boolean | "ArrowDown" | "KeyS" | "DPadDown";

export interface KeyState {
  left: KeyLeft;
  right: KeyRight;
  up: KeyUp;
  down: KeyDown;
}

declare global {
  interface Array<T extends string> {
    includes(searchElement: string, fromIndex?: number): searchElement is T;
  }

  interface Document {
    webkitExitFullscreen: Document["exitFullscreen"];
    webkitFullscreenElement: Document["fullscreenElement"];
    webkitFullscreenEnabled: Document["fullscreenEnabled"];
  }

  interface Element {
    webkitRequestFullscreen: Element["requestFullscreen"];
  }
}

// ItemSlot.js

// import { hotbar } from "./app.js";
// import { item } from "./properties.js";

// import type { ItemID, UnionToIntersection } from "./properties.js";
// import type { HotbarSlotIndex } from "./Hotbar.js";

export interface ItemSlotProps {
  value: Accessor<ItemID | null>;
  index: number;
  active: Accessor<boolean>;
  getSlot: Accessor<HotbarSlotIndex>;
}

export function ItemSlot(props: ItemSlotProps) {
  let ref: HTMLDivElement;
  let itemRenderRef: HTMLDivElement;
  const isActive = createMemo<boolean>(() => props.getSlot() === props.index);

  createEffect(() => {
    const id: ItemID = props.value()!;
    // if (item === null) return;
    const itemEntry = item[id];
    const { texture, animation } = itemEntry as UnionToIntersection<typeof item[typeof id]>;
    const { source, width = 16, height = 16 } = texture;
    // if (this.sprite === id) return;

    ref.setAttribute("data-sprite",id);

    if (animation){
      ref.setAttribute("data-animate","");
      ref.style.setProperty("--width",`${width}px`);
      ref.style.setProperty("--height",`${height}px`);
      ref.style.setProperty("--duration",`${animation.duration}ms`);
      ref.style.setProperty("--keyframes",`${animation.keyframes}`);
    }

    /*
      Another goal would be to add functionality to use the cached image itself (the line above, or `sprite`),
      rather than re-fetching it again in the CSS after being added as a style in `setSlotTexture()`.
      *edit: Super cool idea! Add canvases for each of the item renderers, rather than just an inline element,
      so then it can also eventually allow for item animations :O *edit2: or just use CSS instead :) (it's already implemented now!)
    */
    /*
      It could make sense to make this a method of either the hotbar element, or the hud container once an in-game inventory is implemented.
      Then you could update all item slots for an item to have a certain texture *edit: Almost there!
      This comment used to be in `properties.js`, but now all of the slot rendering logic is part of the slot element itself :)
    */
    itemRenderRef.style.setProperty("background-image",`url("${source}")`);
  });

  return (
    <div
      class="item-slot"
      data-value={props.value()}
      data-index={props.index}
      data-active={isActive() ? "" : null}
      ref={ref!}
    >
      <div
        class="item-render"
        ref={itemRenderRef!}
      />
    </div>
  );
}

// export default ItemSlot;

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
  texture = terrain.tree.texture;

  overlapRender: boolean = false;

  constructor(private readonly player: Player, private readonly explored: { left: number; right: number; top: number; bottom: number; }, private readonly offsetX: () => number, private readonly offsetY: () => number, private readonly key: KeyState, private readonly canvas: HTMLCanvasElement, private readonly ctx: CanvasRenderingContext2D, private readonly getDebugEnabled: Accessor<boolean>) {
    super();

    this.x = Math.floor(Math.random() * this.canvas!.width) - Math.floor(this.canvas!.width / 2) - this.player!.x - 96 / 2;
    //this.y = Math.floor(Math.random() * this.canvas!.height) - this.canvas!.height / 2 - player!.y - 192 / 2;
    if (this.key.up && !this.key.down){
      this.y = - this.player!.y - this.offsetY() - 192;
      if (this.explored.top > this.y) this.explored.top = this.y;
    }
    if (this.key.down && !this.key.up){
      this.y = this.canvas!.height - this.player!.y - this.offsetY();
      if (this.explored.bottom < this.y) this.explored.bottom = this.y;
    }
  }

  draw(): void {
    if (this.overlapRender && this.getDebugEnabled()){
      this.ctx.fillStyle = "#f00";
      this.ctx.fillRect(this.x + this.player!.x + this.offsetX(),this.y + this.player!.y + this.offsetY(),this.box.width,this.box.height);
    }
    this.ctx.drawImage(this.texture.image ?? missingTextureSprite,this.x + this.player!.x + this.offsetX(),this.y + this.player!.y + this.offsetY(),this.box.width,this.box.height);
  }
}

// Service Worker
if (window.isSecureContext && !import.meta.env.DEV){
  await navigator.serviceWorker.register("./service-worker.js", { type: "module" });
}

// Touch Handling

/* This is to allow for :active styling on iOS Safari */
document.body.setAttribute("ontouchstart","");