import { onMount } from "solid-js";
import "./Start.css";
import bandcamp from "/bandcamp.png";
import spearswordTexture from "/textures/item/spearsword.png";

export function Start() {
  let ref: HTMLDialogElement;

  onMount(() => {
    ref!.showModal();
  });

  return (
    <dialog
      class="Start"
      ref={ref!}>
      <form method="dialog">
        <h1>
          <img
            alt="Spearsword icon"
            src={spearswordTexture}
          />
          Flatlands
        </h1>
        <p>
          Created by Brandon Bennett
          <br />
          Soundtrack available on <a
            href="https://rbnaodn.bandcamp.com/album/flatlands">
            <img
              alt="Bandcamp icon"
              src={bandcamp}
            />
            Bandcamp
          </a>
        </p>
        <button
          type="submit"
          autofocus>
          Play
        </button>
      </form>
    </dialog>
  );
}
