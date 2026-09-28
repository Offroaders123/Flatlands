import type { Ref } from "solid-js";
import "./Canvas.css";

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
