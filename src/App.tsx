import { createEffect, createSignal, onMount } from "solid-js";
import { version } from "../package.json";
import Canvas from "./Canvas.js";
import Hud from "./Hud.js";
import Player from "./Player.js";
import { loadDefinitions, loadFeature, missingTextureSprite, terrain } from "./properties.js";
import Tree from "./Tree.js";
import "./App.scss";

import type { HotbarSlotIndex } from "./Hotbar.js";
import type { KeyState } from "./input.js";
import type { ItemID } from "./properties.js";

export interface AppProps {
  isTouchDevice: boolean;
}

export default function App(props: AppProps) {
  let hud: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let coordinates: HTMLDivElement;
  let hotbar: HTMLDivElement;

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

  /*
    Inconsistently implemented, app.js does not handle the gamepad and key logic, it is all used in Player.js.
    Ideally I would like to have user input placed located inside either app.js or it's own ES Module.
  */
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

    ctx = canvas.getContext("2d",{ alpha: false })!;
    loadDefinitions(ctx);

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

    if (props.isTouchDevice){
      setTouchEnabled(true);
    }

    new ResizeObserver(() => {
      const { offsetWidth: width, offsetHeight: height } = canvas;
      canvas.width = width / scaling;
      canvas.height = height / scaling;
      ctx.imageSmoothingEnabled = false;
      draw();
    }).observe(canvas);

    // Environment
    const explored = {
      left: 0,
      right: canvas.width,
      top: 0,
      bottom: canvas.height
    };

    // Trees
    const treesArray: Tree[] = [];

    function handleTrees(): void {
      if (getTick() % 20 === 0){
        if (canvas.height / -2 - player.y - offsetX() < explored.top || canvas.height - player.y - offsetY() > explored.bottom){
          if (key.up && !key.down){
            treesArray.unshift(new Tree(player, explored, offsetX, offsetY, key, canvas, ctx, getDebugEnabled));
          }
          if (key.down && !key.up){
            treesArray.push(new Tree(player, explored, offsetX, offsetY, key, canvas, ctx, getDebugEnabled));
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

    terrain.ground.texture.pattern = ctx.createPattern(missingTextureSprite, "repeat")!;
    loadFeature(terrain.ground, ctx);
    // terrain.ground.texture.pattern = ctx.createPattern(image, "repeat")!;

    let scaling = 4;

    function offsetX(): number {
      return Math.round(canvas.width / 2);
    }

    function offsetY(): number {
      return Math.round(
        (canvas.offsetHeight + (coordinates?.offsetHeight ?? 0) - (hotbar?.offsetHeight ?? 0) - (hud !== null ? parseInt(getComputedStyle(hud).paddingBottom) : 0))
        / scaling / 2
      );
    }

    // Update Game State
    function update(): void {
      player.update();
      setTick(previous => previous += 1);
    }

    // Draw Game State to the renderer
    function draw(): void {
      const { width, height } = canvas;

      // Reset for next frame
      ctx.clearRect(0,0,width,height);

      // Draw Grass
      ctx.fillStyle = terrain.ground.texture.pattern!;
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
        setTimeOrigin(timeOrigin);
        setTick(getTick);
        setDelta(delta);

      setPlayerX(player.x);
      setPlayerY(player.y);
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
      <Canvas
        ref={canvas!}
      />
      <Hud
        getDebugEnabled={getDebugEnabled}
        setDebugEnabled={setDebugEnabled}
        getPlayerX={getPlayerX}
        getPlayerY={getPlayerY}
        getVersion={getVersion}
        getTimeOrigin={getTimeOrigin}
        getTick={getTick}
        getFrames={getFrames}
        getDroppedFrames={getDroppedFrames}
        getDelta={getDelta}
        getSlot={getSlot}
        setSlot={setSlot}
        getSlot0={getSlot0}
        getSlot1={getSlot1}
        getSlot2={getSlot2}
        getSlot3={getSlot3}
        getSlot4={getSlot4}
        getSlot5={getSlot5}
        ref={hud!}
        coordinates={coordinates!}
        hotbar={hotbar!}
        key={key}
      />
    </>
  );
}