/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.js";
import "./index.scss";

const isTouchDevice: boolean = "ontouchstart" in window || navigator.maxTouchPoints > 0;

// Service Worker
if (window.isSecureContext && !import.meta.env.DEV){
  await navigator.serviceWorker.register("./service-worker.js", { type: "module" });
}

// Touch Handling

/* This is to allow for :active styling on iOS Safari */
document.body.setAttribute("ontouchstart","");

const root: HTMLDivElement = document.querySelector("#root")!;

render(() => <App isTouchDevice={isTouchDevice}/>, root);