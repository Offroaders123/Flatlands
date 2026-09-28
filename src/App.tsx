import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import Game from "./Game.js";
import "./App.scss";

export interface AppProps {
  isTouchDevice: boolean;
}

export default function App(props: AppProps) {
  const cleanup = new AbortController();

  const [getTouchEnabled, setTouchEnabled] = createSignal<boolean>(false);

  const gamepads: number[] = [];
  
  onMount(() => {
    window.addEventListener("gamepadconnected",event => {
      if (!event.gamepad.mapping) return;
      gamepads.push(event.gamepad.index);
      //console.log("Connected!\n",navigator.getGamepads()[event.gamepad.index]);
    }, { signal: cleanup.signal });

    window.addEventListener("gamepaddisconnected",event => {
      if (!event.gamepad.mapping) return;
      //console.log("Disconnected.\n",event.gamepad.index);
      gamepads.splice(gamepads.indexOf(event.gamepad.index));
    }, { signal: cleanup.signal });

    document.addEventListener("keydown",event => {
      if (event.repeat || document.activeElement != document.body) return;
      setTouchEnabled(false);
    }, { signal: cleanup.signal });

    document.addEventListener("touchstart",() => {
      setTouchEnabled(true);
    }, { signal: cleanup.signal });

    document.addEventListener("contextmenu",event => {
      event.preventDefault();
    }, { signal: cleanup.signal });

    if (props.isTouchDevice){
      setTouchEnabled(true);
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

  onCleanup(() => cleanup.abort());

  return (
    <Game
      gamepads={gamepads}
    />
  );
}