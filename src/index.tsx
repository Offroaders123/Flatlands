/* @refresh reload */
import { render } from "solid-js/web";

const root = document.querySelector<HTMLDivElement>("#root")!;

render(() => <App />, root);

await import("./app.js");

export function App() {
  return (
    <>
      <canvas id="canvas"></canvas>
      <hud-panel>
        <input id="debug_toggle" type="checkbox" tabindex="-1"/>
        <debug-panel></debug-panel>
        <coordinates-panel></coordinates-panel>
        <hotbar-panel>
          <item-slot index="0"></item-slot>
          <item-slot index="1"></item-slot>
          <item-slot index="2"></item-slot>
          <item-slot index="3"></item-slot>
          <item-slot index="4"></item-slot>
          <item-slot index="5"></item-slot>
        </hotbar-panel>
        <dpad-panel>
          <button data-left tabindex="-1"/>
          <button data-right tabindex="-1"/>
          <button data-up tabindex="-1"/>
          <button data-down tabindex="-1"/>
        </dpad-panel>
      </hud-panel>
    </>
  );
}