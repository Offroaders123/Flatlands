import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { GamepadObserver } from "gamepad-state";
import Game from "./Game.js";
import "./App.scss";

export interface AppProps {
  isTouchDevice: boolean;
}

export default function App(props: AppProps) {
  const cleanup = new AbortController();

  const [getTouchEnabled, setTouchEnabled] = createSignal<boolean>(false);
  const [getGamepad, setGamepad] = createSignal<Gamepad | null>(null);

  const observer = new GamepadObserver(record => {
    if (!record.gamepad.mapping) return; // Also related to the Chrome bug below.

    switch (record.type) {
      case "connect":
      case "input": return setGamepad(record.gamepad);
      case "disconnect": return setGamepad(null);
    }
  });

  // This is to account for a bug in Chrome macOS where my SteelSeries Nimbus shows up as two controllers.
  observer.observe(0);
  observer.observe(1);

  onMount(() => {
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

  onCleanup(() => {
    cleanup.abort();
    observer.disconnect();
  });

  return (
    <Game
      getGamepad={getGamepad}
    />
  );
}