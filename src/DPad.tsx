// DPad.js

import { createEffect, onCleanup } from "solid-js";

import type { KeyState } from "./input.js";

// import { key } from "./input.js";

export interface DPadProps {
  key: KeyState;
}

export default function DPad(props: DPadProps) {
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