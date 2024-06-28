import { Show } from "solid-js";
import Coordinates from "./Coordinates.js";
import Debug from "./Debug.js";
import DPad from "./DPad.js";
import Hotbar from "./Hotbar.js";
import "./Hud.scss";

import type { Accessor, Ref, Setter } from "solid-js";
import type { HotbarSlotIndex } from "./Hotbar.js";
import type { ItemID } from "./properties.js";
import type { KeyState } from "./input.js";

export interface HudProps {
  getDebugEnabled: Accessor<boolean>;
  setDebugEnabled: Setter<boolean>;
  getPlayerX: Accessor<number>;
  getPlayerY: Accessor<number>;
  getVersion: Accessor<string>;
  getTimeOrigin: Accessor<number>;
  getTick: Accessor<number>;
  getFrames: Accessor<number>;
  getDroppedFrames: Accessor<number>;
  getDelta: Accessor<number>;
  getSlot: Accessor<HotbarSlotIndex>;
  setSlot: Setter<HotbarSlotIndex>;
  getSlot0: Accessor<ItemID | null>;
  getSlot1: Accessor<ItemID | null>;
  getSlot2: Accessor<ItemID | null>;
  getSlot3: Accessor<ItemID | null>;
  getSlot4: Accessor<ItemID | null>;
  getSlot5: Accessor<ItemID | null>;
  ref: Ref<HTMLDivElement>;
  coordinates: (value: HTMLDivElement) => void;
  hotbar: (value: HTMLDivElement) => void;
  key: KeyState;
}

export default function Hud(props: HudProps) {
  return (
    <div
      class="Hud"
      ref={props.ref}>
      <input
        class="DebugToggle"
        type="checkbox"
        tabindex="-1"
        checked={props.getDebugEnabled()}
        oninput={event => props.setDebugEnabled(event.currentTarget.checked)}
      />
      <Show when={props.getDebugEnabled()}>
        <Debug
          version={props.getVersion()}
          timeOrigin={props.getTimeOrigin()}
          getTick={props.getTick}
          getFrames={props.getFrames}
          getDroppedFrames={props.getDroppedFrames}
          getDelta={props.getDelta}
        />
      </Show>
      <Coordinates
        getPlayerX={props.getPlayerX}
        getPlayerY={props.getPlayerY}
        ref={props.coordinates}
      />
      <Hotbar
        getSlot={props.getSlot}
        getActive={props.getSlot}
        setActive={props.setSlot}
        getSlot0={props.getSlot0}
        getSlot1={props.getSlot1}
        getSlot2={props.getSlot2}
        getSlot3={props.getSlot3}
        getSlot4={props.getSlot4}
        getSlot5={props.getSlot5}
        ref={props.hotbar}
      />
      <DPad
        key={props.key}
      />
    </div>
  );
}