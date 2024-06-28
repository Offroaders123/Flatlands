import { createMemo } from "solid-js";

import type { Accessor, Ref } from "solid-js";

export interface CoordinatesProps {
  getPlayerX: Accessor<number>;
  getPlayerY: Accessor<number>;
  ref: Ref<HTMLDivElement>;
}

export default function Coordinates(props: CoordinatesProps) {
  const displayX = createMemo<number>(() => Math.round(props.getPlayerX() / 16) * -1);
  const displayY = createMemo<number>(() => Math.round(props.getPlayerY() / 16));

  return (
    <div
      class="Coordinates"
      ref={props.ref}>
      ({displayX()}, {displayY()})
    </div>
  );
}