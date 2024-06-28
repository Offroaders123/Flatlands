import "./Canvas.scss";

import type { Ref } from "solid-js";

export interface CanvasProps {
  ref: Ref<HTMLCanvasElement>;
}

export default function Canvas(props: CanvasProps) {
  return (
    <canvas
      class="Canvas"
      ref={props.ref}
    />
  );
}