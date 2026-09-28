import { type EntityAbstract, getBoundingClientRect } from "./Entity.js";
import { entity, item, missingTextureSprite } from "./properties.js";

import type { Accessor, Setter } from "solid-js";
import type { HotbarSlotIndex } from "./Hotbar.js";
import type { Tree } from "./Tree.js";
import type { KeyState } from "./input.js";
import type { AnimatedDefinition, ItemID, ReactiveAnimation, UnionToIntersection } from "./properties.js";

export interface PlayerDirection {
  horizontal: PlayerHorizontal;
  vertical: PlayerVertical;
}

export type PlayerHorizontal = "left" | "right";

export type PlayerVertical = false | "down" | "up";

export interface PlayerHotbar {
  slots: [SlotItem, SlotItem, SlotItem, SlotItem, SlotItem, SlotItem];
  active: HotbarSlotIndex;
  readonly held_item: SlotItem;
}

export type SlotItem = ItemID | null;

export interface Player extends EntityAbstract, /*BaseDefinition,*/ AnimatedDefinition<ReactiveAnimation> {
  name: string;
  direction: PlayerDirection;
  hotbar: PlayerHotbar;
  speed: number;
}

export function createPlayer(): Player {
  const player: Player = {
    x: 0,
    y: 0,
    name: "Player",
    box: {
      width: 16,
      height: 32
    },
    texture: entity.player.texture,
    animation: {
      type: "reactive",
      duration: 24,
      keyframes: 2,
      columns: 4,
      tick: 0,
      frame: 0,
      column: 0
    },
    direction: {
      horizontal: "right",
      vertical: false
    },
    hotbar: {
      slots: [
        "spearsword",
        "pickmatic",
        "hatchet",
        "spade",
        "fire",
        "pizza"
      ],
      active: 4,
      held_item: null
    },
    speed: 2
  };

  Object.defineProperty(player.hotbar, "held_item", { get: () => player.hotbar.slots[player.hotbar.active] });

  return player;
}

export function getEntityOverlap(
  player: Player,
  treesArray: Tree[],
): void {
  const rect1 = getBoundingClientRect(player);
  for (const tree of treesArray) {
    const rect2 = getBoundingClientRect(tree);
    const overlap =
      (-rect1.top <= rect2.bottom &&
        -rect1.bottom >= rect2.top &&
        -rect1.left <= rect2.right &&
        -rect1.right >= rect2.left);
    tree.overlapRender = overlap;
  }
}

export function updatePlayer(
  player: Player,
  getSlot: Accessor<HotbarSlotIndex>,
  setSlot: Setter<HotbarSlotIndex>,
  treesArray: Tree[],
  key: KeyState,
  gamepads: number[],
  getTick: Accessor<number>,
): void {
  getEntityOverlap(player, treesArray);
  // // @ts-expect-error - this might be causing the gamepad crashes
  const gamepad = navigator.getGamepads()[gamepads[0]!];

  let [axisX, axisY] = (gamepad) ? gamepad.axes : [null, null, null, null];
  let [left1, right1] = (gamepad) ? [gamepad.buttons[4]!.value, gamepad.buttons[5]!.value] : [null, null];

  if (gamepad) {
    key.left = (Math.round(axisX as number * 1000) < 0);
    key.right = (Math.round(axisX as number * 1000) > 0);
    key.up = (Math.round(axisY as number * 1000) < 0);
    key.down = (Math.round(axisY as number * 1000) > 0);

    let active: HotbarSlotIndex = getSlot();

    if (left1 && !right1 && getTick() % 10 == 0) {
      const previous: HotbarSlotIndex = active === 0 ? 5 : active - 1 as HotbarSlotIndex;
      setSlot(previous);
    }
    if (right1 && !left1 && getTick() % 10 == 0) {
      const next: HotbarSlotIndex = active === 5 ? 0 : active + 1 as HotbarSlotIndex;
      setSlot(next);
    }
  }

  const { left, right, up, down } = key;
  const cardinal = player.speed;

  /* Cardinals */
  if (left && !right) {
    player.x += cardinal * (-axisX! || 1);
  }
  if (right && !left) {
    player.x -= cardinal * (axisX! || 1);
  }
  if (up && !down) {
    player.y += cardinal * (-axisY! || 1);
  }
  if (down && !up) {
    player.y -= cardinal * (axisY! || 1);
  }

  if (key.left && !key.right) {
    player.direction.horizontal = "left";
  }
  if (key.right && !key.left) {
    player.direction.horizontal = "right";
  }

  if (key.down && !key.up && !key.left && !key.right) {
    player.direction.vertical = "down";
  }
  if (key.up && !key.down && !key.left && !key.right) {
    player.direction.vertical = "up";
  }
  if (!key.up && !key.down || key.left || key.right) {
    player.direction.vertical = false;
  }

  if (player.direction.vertical == "down") {
    player.animation.column = 2;
  }
  if (player.direction.vertical == "up") {
    player.animation.column = 3;
  }
  if (!player.direction.vertical) {
    player.animation.column = 1;
  }

  if ((key.left && !key.right) || (key.right && !key.left) || (key.up && !key.down) || (key.down && !key.up)) {
    player.animation.tick++;
  } else {
    player.animation.column = 0;
    player.direction.vertical = false;
  }
  if (player.animation.tick > player.animation.duration - 1) {
    player.animation.tick = 0;
    (player.animation.frame < player.animation.keyframes - 1) ? player.animation.frame++ : player.animation.frame = 0;
  }
}

export function drawPlayer(
  player: Player,
  offsetX: () => number,
  offsetY: () => number,
  ctx: CanvasRenderingContext2D,
  getTick: Accessor<number>,
): void {
  let scale: 1 | -1 = 1;
  let offset = 1;
  let itemScale = 1;

  if (player.direction.horizontal === "left" && player.direction.vertical !== "up") {
    scale = -1;
  }
  if (player.direction.horizontal === "right" && player.direction.vertical === "up") {
    scale = -1;
  }
  if (player.direction.horizontal === "right" && player.direction.vertical) {
    offset = 0;
  }
  if (player.direction.vertical) {
    itemScale = 2 / 3;
  }

  ctx.setTransform(scale, 0, 0, 1, offsetX(), offsetY());
  ctx.transform(1, 0, 0, 1, -7, 14);

  ctx.drawImage(entity.shadow.texture.image ?? missingTextureSprite, 0, 0, player.box.width - 2, 4);
  if (player.direction.vertical === "down") {
    drawPlayerCharacter(player, offsetX, offsetY, ctx, scale, offset);
    drawPlayerItem(player, offsetX, offsetY, ctx, getTick, scale, itemScale);
  } else {
    drawPlayerItem(player, offsetX, offsetY, ctx, getTick, scale, itemScale);
    drawPlayerCharacter(player, offsetX, offsetY, ctx, scale, offset);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function drawPlayerItem(
  player: Player,
  offsetX: () => number,
  offsetY: () => number,
  ctx: CanvasRenderingContext2D,
  getTick: Accessor<number>,
  scale: number,
  itemScale: number,
): void {
  if (player.hotbar.held_item === null) return;
  const definition = item![player.hotbar.held_item] as UnionToIntersection<NonNullable<typeof item>[typeof player.hotbar.held_item]>;
  let { naturalWidth: width, naturalHeight: height } = definition.texture.image ?? missingTextureSprite;
  if (definition.animation) {
    height /= definition.animation.keyframes;
  }

  ctx.setTransform(scale, 0, 0, 1, offsetX(), offsetY());
  ctx.transform(1, 0, 0, 1, player.box.width / -2 + 1, player.box.height / -2);
  ctx.transform(1, 0, 0, 1, 10, 5);

  if (definition.texture.directional !== false) {
    ctx.scale(-1 * itemScale, 1);
    ctx.transform(1, 0, 0, 1, -width, height);
    ctx.rotate(Math.PI * -1 / 2);
  } else {
    ctx.transform(1, 0, 0, 1, -1, -1);
    ctx.scale(itemScale, 1);
  }

  let keyframe = 0;
  if (definition.animation) {
    const current = getTick() / 60 * 1000;
    const { duration, keyframes } = definition.animation;
    keyframe = Math.floor((current % duration) / duration * keyframes) * height;
  }

  ctx.drawImage(
    definition.texture.image ?? missingTextureSprite,
    0,
    keyframe,
    width,
    height,
    player.direction.vertical ? player.direction.vertical === "up" ? -2 : -1 : 0,
    1,
    width,
    height
  );
}

export function drawPlayerCharacter(
  player: Player,
  offsetX: () => number,
  offsetY: () => number,
  ctx: CanvasRenderingContext2D,
  _scale: number,
  offset: number,
): void {
  ctx.setTransform(player.direction.horizontal === "left" && !player.direction.vertical ? -1 : 1, 0, 0, 1, offsetX(), offsetY());
  ctx.transform(1, 0, 0, 1, player.box.width / -2 + offset, player.box.height / -2);
  ctx.drawImage(
    player.texture.image ?? missingTextureSprite,
    player.box.width * (player.animation.column !== 0 ? player.animation.frame : 0),
    player.box.height * player.animation.column,
    player.box.width,
    player.box.height,
    0,
    0,
    player.box.width,
    player.box.height
  );
}
