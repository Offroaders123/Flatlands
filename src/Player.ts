import EntityAbstract from "./Entity.js";
import { entity, item, missingTextureSprite } from "./properties.js";

import type { Accessor, Setter } from "solid-js";
import type { HotbarSlotIndex } from "./Hotbar.js";
import type Tree from "./Tree.js";
import type { KeyState } from "./input.js";
import type { AnimatedDefinition, BaseDefinition, ItemID, ReactiveAnimation, UnionToIntersection } from "./properties.js";

export default class Player extends EntityAbstract implements BaseDefinition, AnimatedDefinition {
  name = "Player";
  box = {
    width: 16,
    height: 32
  };
  texture = entity.player.texture;
  animation = {
    type: "reactive",
    duration: 24,
    keyframes: 2,
    columns: 4,
    tick: 0,
    frame: 0,
    column: 0
  } as ReactiveAnimation;
  direction = {
    horizontal: "right",
    vertical: false
  } as {
    horizontal: "left" | "right";
    vertical: false | "down" | "up";
  };
  hotbar = {
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
  } as {
    slots: [ItemID | null, ItemID | null, ItemID | null, ItemID | null, ItemID | null, ItemID | null];
    active: HotbarSlotIndex;
    readonly held_item: ItemID | null;
  };
  speed = 2;

  constructor(private readonly getSlot: Accessor<HotbarSlotIndex>, private readonly setSlot: Setter<HotbarSlotIndex>, private readonly treesArray: Tree[], private readonly offsetX: () => number, private readonly offsetY: () => number, private readonly key: KeyState, private readonly gamepads: number[], private readonly ctx: CanvasRenderingContext2D, private readonly getTick: Accessor<number>) {
    super();

    // Define properties only used internally by the game that don't need to be in the source file
    this.animation.tick = 0;
    this.animation.frame = 0;
    this.animation.column = 0;

    Object.defineProperty(this.hotbar,"held_item",{ get: () => this.hotbar.slots[this.hotbar.active] });
  }

  getEntityOverlap(): void {
    const rect1 = this.getBoundingClientRect();
    for (const tree of this.treesArray){
      const rect2 = tree.getBoundingClientRect();
      const overlap =
        (-rect1.top <= rect2.bottom &&
         -rect1.bottom >= rect2.top &&
         -rect1.left <= rect2.right &&
         -rect1.right >= rect2.left);
      tree.overlapRender = overlap;
    }
  }

  update(): void {
    this.getEntityOverlap();
    //// @ts-expect-error - this might be causing the gamepad crashes
    const gamepad = navigator.getGamepads()[this.gamepads[0]!];

    let [axisX,axisY] = (gamepad) ? gamepad.axes : [null,null,null,null];
    let [left1,right1] = (gamepad) ? [gamepad.buttons[4]!.value,gamepad.buttons[5]!.value] : [null,null];

    if (gamepad){
      this.key.left = (Math.round(axisX as number * 1000) < 0);
      this.key.right = (Math.round(axisX as number * 1000) > 0);
      this.key.up = (Math.round(axisY as number * 1000) < 0);
      this.key.down = (Math.round(axisY as number * 1000) > 0);

      let active: HotbarSlotIndex = this.getSlot();

      if (left1 && !right1 && this.getTick() % 10 == 0){
        const previous: HotbarSlotIndex = active === 0 ? 5 : active - 1 as HotbarSlotIndex;
        this.setSlot(previous);
      }
      if (right1 && !left1 && this.getTick() % 10 == 0){
        const next: HotbarSlotIndex = active === 5 ? 0 : active + 1 as HotbarSlotIndex;
        this.setSlot(next);
      }
    }

    const { left, right, up, down } = this.key;
    const cardinal = this.speed;

    /* Cardinals */
    if (left && !right){
      this.x += cardinal * (-axisX! || 1);
    }
    if (right && !left){
      this.x -= cardinal * (axisX! || 1);
    }
    if (up && !down){
      this.y += cardinal * (-axisY! || 1);
    }
    if (down && !up){
      this.y -= cardinal * (axisY! || 1);
    }

    if (this.key.left && !this.key.right){
      this.direction.horizontal = "left";
    }
    if (this.key.right && !this.key.left){
      this.direction.horizontal = "right";
    }

    if (this.key.down && !this.key.up && !this.key.left && !this.key.right){
      this.direction.vertical = "down";
    }
    if (this.key.up && !this.key.down && !this.key.left && !this.key.right){
      this.direction.vertical = "up";
    }
    if (!this.key.up && !this.key.down || this.key.left || this.key.right){
      this.direction.vertical = false;
    }

    if (this.direction.vertical == "down"){
      this.animation.column = 2;
    }
    if (this.direction.vertical == "up"){
      this.animation.column = 3;
    }
    if (!this.direction.vertical){
      this.animation.column = 1;
    }

    if ((this.key.left && !this.key.right) || (this.key.right && !this.key.left) || (this.key.up && !this.key.down) || (this.key.down && !this.key.up)){
      this.animation.tick++;
    } else {
      this.animation.column = 0;
      this.direction.vertical = false;
    }
    if (this.animation.tick > this.animation.duration - 1){
      this.animation.tick = 0;
      (this.animation.frame < this.animation.keyframes - 1) ? this.animation.frame++ : this.animation.frame = 0;
    }
  }

  draw(): void {
    let scale = 1;
    let offset = 1;
    let itemScale = 1;

    if (this.direction.horizontal === "left" && this.direction.vertical !== "up"){
      scale = -1;
    }
    if (this.direction.horizontal === "right" && this.direction.vertical === "up"){
      scale = -1;
    }
    if (this.direction.horizontal === "right" && this.direction.vertical){
      offset = 0;
    }
    if (this.direction.vertical){
      itemScale = 2/3;
    }

    this.ctx.setTransform(scale,0,0,1,this.offsetX(),this.offsetY());
    this.ctx.transform(1,0,0,1,-7,14);

    this.ctx.drawImage(entity.shadow.texture.image ?? missingTextureSprite,0,0,this.box.width - 2,4);
    if (this.direction.vertical === "down"){
      this.drawCharacter(scale,offset);
      this.drawItem(scale,itemScale);
    } else {
      this.drawItem(scale,itemScale);
      this.drawCharacter(scale,offset);
    }

    this.ctx.setTransform(1,0,0,1,0,0);
  }

  drawItem(scale: number, itemScale: number): void {
    if (this.hotbar.held_item === null) return;
    const definition = item![this.hotbar.held_item] as UnionToIntersection<NonNullable<typeof item>[typeof this.hotbar.held_item]>;
    let { naturalWidth: width, naturalHeight: height } = definition.texture.image ?? missingTextureSprite;
    if (definition.animation){
      height /= definition.animation.keyframes;
    }

    this.ctx.setTransform(scale,0,0,1,this.offsetX(),this.offsetY());
    this.ctx.transform(1,0,0,1,this.box.width / -2 + 1,this.box.height / -2);
    this.ctx.transform(1,0,0,1,10,5);

    if (definition.texture.directional !== false){
      this.ctx.scale(-1 * itemScale,1);
      this.ctx.transform(1,0,0,1,-width,height);
      this.ctx.rotate(Math.PI * -1 / 2);
    } else {
      this.ctx.transform(1,0,0,1,-1,-1);
      this.ctx.scale(itemScale,1);
    }

    let keyframe = 0;
    if (definition.animation){
      const current = this.getTick() / 60 * 1000;
      const { duration, keyframes } = definition.animation;
      keyframe = Math.floor((current % duration) / duration * keyframes) * height;
    }

    this.ctx.drawImage(
      definition.texture.image ?? missingTextureSprite,
      0,
      keyframe,
      width,
      height,
      this.direction.vertical ? this.direction.vertical === "up" ? -2 : -1 : 0,
      1,
      width,
      height
    );
  }

  drawCharacter(_scale: number, offset: number): void {
    this.ctx.setTransform(this.direction.horizontal === "left" && !this.direction.vertical ? -1 : 1,0,0,1,this.offsetX(),this.offsetY());
    this.ctx.transform(1,0,0,1,this.box.width / -2 + offset,this.box.height / -2);
    this.ctx.drawImage(
      this.texture.image ?? missingTextureSprite,
      this.box.width * (this.animation.column !== 0 ? this.animation.frame : 0),
      this.box.height * this.animation.column,
      this.box.width,
      this.box.height,
      0,
      0,
      this.box.width,
      this.box.height
    );
  }
}