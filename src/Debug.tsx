// Debug.js

import { createMemo, on } from "solid-js";

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
  ref(ref: HTMLDivElement): void;
}

export default function Debug(props: DebugProps) {
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