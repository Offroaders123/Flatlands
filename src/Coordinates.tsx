// Coordinates.js

// import { player } from "./app.js";

export interface CoordinatesProps {
  getPlayerX: Accessor<number>;
  getPlayerY: Accessor<number>;
  ref(value: HTMLDivElement): void;
}

export function Coordinates(props: CoordinatesProps) {
  const displayX = createMemo<number>(() => Math.round(props.getPlayerX() / 16) * -1);
  const displayY = createMemo<number>(() => Math.round(props.getPlayerY() / 16));

  return (
    <div class="coordinates-panel" ref={props.ref}>({displayX()}, {displayY()})</div>
  );
}

// export default Coordinates;