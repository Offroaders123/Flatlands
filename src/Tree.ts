import { type EntityAbstract } from "./Entity.js";
import { missingTextureSprite, terrain } from "./properties.js";

import type { Accessor } from "solid-js";
import type { Player } from "./Player.js";
import type { KeyState } from "./input.js";

export interface Tree extends EntityAbstract {
  name: string;
  overlapRender: boolean;
}

export function createTree(
  player: Player,
  explored: { left: number; right: number; top: number; bottom: number; },
  offsetY: () => number,
  key: KeyState,
  canvas: HTMLCanvasElement,
): Tree {
  const tree: Tree = {
    x: 0,
    y: 0,
    name: "Tree",
    box: {
      width: 96,
      height: 192
    },
    texture: terrain.tree.texture,
    overlapRender: false
  };

  tree.x = Math.floor(Math.random() * canvas.width) - Math.floor(canvas.width / 2) - player.x - 96 / 2;
  // tree.y = Math.floor(Math.random() * canvas.height) - canvas.height / 2 - player.y - 192 / 2;
  if (key.up && !key.down) {
    tree.y = - player.y - offsetY() - 192;
    if (explored.top > tree.y) explored.top = tree.y;
  }
  if (key.down && !key.up) {
    tree.y = canvas.height - player.y - offsetY();
    if (explored.bottom < tree.y) explored.bottom = tree.y;
  }

  return tree;
}

export function drawTree(
  tree: Tree,
  player: Player,
  offsetX: () => number,
  offsetY: () => number,
  ctx: CanvasRenderingContext2D,
  getDebugEnabled: Accessor<boolean>,
): void {
  if (tree.overlapRender && getDebugEnabled()) {
    ctx.fillStyle = "#f00";
    ctx.fillRect(tree.x + player.x + offsetX(), tree.y + player.y + offsetY(), tree.box.width, tree.box.height);
  }
  ctx.drawImage(tree.texture.image ?? missingTextureSprite, tree.x + player.x + offsetX(), tree.y + player.y + offsetY(), tree.box.width, tree.box.height);
}
