import { coordinates, hotbar, hud } from "./app.js";

export const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
export const ctx = canvas.getContext("2d",{ alpha: false })!;

export let scaling = 4;

export function offsetX(){
  return Math.round(canvas.width / 2);
}

export function offsetY(){
  return Math.round((canvas.offsetHeight + coordinates.offsetHeight - hotbar.offsetHeight - parseInt(getComputedStyle(hud).paddingBottom)) / scaling / 2);
}