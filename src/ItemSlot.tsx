import { createEffect, createMemo } from "solid-js";
import { item } from "./properties.js";

import type { Accessor } from "solid-js";
import type { ItemID, UnionToIntersection } from "./properties.js";
import type { HotbarSlotIndex } from "./Hotbar.js";

export interface ItemSlotProps {
  value: Accessor<ItemID | null>;
  index: number;
  active: Accessor<boolean>;
  getSlot: Accessor<HotbarSlotIndex>;
}

export default function ItemSlot(props: ItemSlotProps) {
  let ref: HTMLDivElement;
  let itemRenderRef: HTMLDivElement;
  const isActive = createMemo<boolean>(() => props.getSlot() === props.index);

  createEffect(() => {
    const id: ItemID = props.value()!;
    const itemEntry = item[id];
    const { texture, animation } = itemEntry as UnionToIntersection<typeof item[typeof id]>;
    const { source, width = 16, height = 16 } = texture;

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
      class="ItemSlot"
      data-value={props.value()}
      data-index={props.index}
      data-active={isActive() ? "" : null}
      ref={ref!}>
      <div
        class="ItemRender"
        ref={itemRenderRef!}
      />
    </div>
  );
}