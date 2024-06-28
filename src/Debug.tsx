// Debug.js

import { createEffect, createMemo, createSignal, on } from "solid-js";

import type { Accessor } from "solid-js";

// import Flatlands from "./Flatlands.js";
// import { timeOrigin, tick, delta } from "./app.js";

export interface DebugProps {
  version: string;
  timeOrigin: number;
  getTick: Accessor<number>;
  getFrames: Accessor<number>;
  getDroppedFrames: Accessor<number>;
  getDelta: Accessor<number>;
  // ref(ref: HTMLDivElement): void;
}

export default function Debug(props: DebugProps) {
  let ref: HTMLDivElement;
  const [getTick, setTick] = createSignal<number>(props.getTick());

  createEffect(on(props.getTick, () => {
    if (ref.matches(":hover")) return;
    setTick(props.getTick);
  }));

  const getCurrentTime = createMemo<string>(on(getTick, () => new Date().toLocaleTimeString()));
  const getGameTime = createMemo<number>(on(getTick, () => Math.floor((Date.now() - props.timeOrigin) / 1000)));
  const getTickTime = createMemo<number>(() => Math.floor(getTick() / 60));
  const getMilliseconds = createMemo<number>(() => Math.floor(getTick() / 60 * 1000));
  const getFrames = createMemo<number>(on(getTick, props.getFrames));
  const getDroppedFrames = createMemo<number>(on(getTick, props.getDroppedFrames));
  const getFrameDelta = createMemo<string>(on(getTick, () => Math.floor(props.getDelta()).toString().padStart(2,"0")));

  return (
    <div class="debug-panel" ref={ref!}>
      <pre>
        Flatlands v{props.version}{"\n"}
        Time Origin: {props.timeOrigin}{"\n"}
        Current Time: {getCurrentTime()}{"\n"}
        Game Time: {getGameTime()}s{"\n"}
        Ticks: {getTick()}{"\n"}
        Tick Time: {getTickTime()}s{"\n"}
        Milliseconds: {getMilliseconds()}ms{"\n"}
        Frames: {getFrames()}{"\n"}
        Dropped Frames: {getDroppedFrames()}{"\n"}
        Frame Delta: {getFrameDelta()}{"\n"}
      </pre>
    </div>
  );
}

// export default Debug;