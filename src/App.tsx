import { createEffect, createSignal, onMount } from "solid-js";
import Game from "./Game.js";
import "./App.scss";

export interface AppProps {
  isTouchDevice: boolean;
}

export default function App(props: AppProps) {
  const [getTouchEnabled, setTouchEnabled] = createSignal<boolean>(false);

  const gamepads: number[] = [];
  
  onMount(() => {
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
  });

  createEffect(() => {
    const touchEnabled: boolean = getTouchEnabled();
    if (touchEnabled){
      document.documentElement.classList.add("touch");
    } else {
      document.documentElement.classList.remove("touch");
    }
  });

  return (
    <Game
      gamepads={gamepads}
    />
  );
}