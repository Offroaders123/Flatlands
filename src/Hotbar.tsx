import { createEffect, createMemo, onCleanup } from "solid-js";
import ItemSlot from "./ItemSlot.js";
import "./Hotbar.scss";

import type { Accessor, Setter } from "solid-js";
import type Player from "./Player.js";
import type { ItemID } from "./properties.js";

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
  ref: (value: HTMLDivElement) => void;
}

export default function Hotbar(props: HotbarProps) {
  let ref: HTMLDivElement;
  const cleanup = new AbortController();

  createEffect(() => {
    ref.addEventListener("touchstart",event => {
      if (!(event.target instanceof Element)) return;
      event.preventDefault();
      const slot = event.target.closest<HTMLDivElement>(".ItemSlot");
      if (slot === null) return;
      const index: HotbarSlotIndex = Number(slot.getAttribute("data-index")!) as HotbarSlotIndex;
      props.setActive(index);
    },{ signal: cleanup.signal, passive: false });
  });

  onCleanup(() => cleanup.abort());

  return (
    <div
      class="Hotbar"
      ref={hotbar => { props.ref(hotbar); ref = hotbar; }}>
      {
        Array.from({ length: 6 }).map((_, i) => {
          const index = i as HotbarSlotIndex;
          const isActive = createMemo<boolean>(() => props.getActive() === index);
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