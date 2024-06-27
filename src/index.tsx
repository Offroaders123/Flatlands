/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.js";
import "./index.scss";

const root = document.querySelector<HTMLDivElement>("#root")!;

render(() => <App/>, root);