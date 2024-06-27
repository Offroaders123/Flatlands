/* @refresh reload */
import { render } from "solid-js/web";
import { Show, createEffect, createMemo, createSignal, on, onCleanup, onMount } from "solid-js";

import type { Accessor, Setter } from "solid-js";

import "./index.scss";

const root = document.querySelector<HTMLDivElement>("#root")!;

render(() => <App/>, root);