import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { MusicManager } from "./MusicManager.ts";
import "./Start.css";
import { tracks } from "./music.ts";
import bandcamp from "/bandcamp.png";
import icon from "/icon-16.png";

export function Start() {
  let ref: HTMLDialogElement;
  const [musicPlaying, setMusicPlaying] = createSignal<boolean>(false);

  const musicManager = new MusicManager(tracks, tracks[2]!);

  onMount(() => {
    ref!.showModal();
  });

  onCleanup(() => {
    musicManager.dispose();
  });

  createEffect(() => {
    if (musicPlaying() === false) return;
    musicManager.start();
  });

  return (
    <dialog
      class="Start"
      ref={ref!}>
      <form method="dialog">
        <h1>
          <img
            alt="Flatlands icon"
            src={icon}
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
          autofocus
          on:click={() => {
            setMusicPlaying(true);
          }}>
          Play
        </button>
      </form>
    </dialog>
  );
}
