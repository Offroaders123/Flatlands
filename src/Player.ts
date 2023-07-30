import { Entity } from "./Entity.js";
import { hotbar, tick, treesArray } from "./app.js";
import { ctx, offsetX, offsetY } from "./canvas.js";
import { key, gamepads } from "./input.js";
import { entity, item } from "./properties.js";

import type ItemSlot from "./ItemSlot.js";
import type { HotbarSlotIndex } from "./Hotbar.js";
import type { ItemID, UnionToIntersection } from "./properties.js";

export class Player extends Entity {
  declare animation: {
    type: string;
    duration: number;
    keyframes: number;
    columns: number;

    tick: number;
    frame: number;
    column: number;
  };
  
  declare direction: {
    horizontal: string;
    vertical: string | boolean;
  };

  declare hotbar: {
    slots: [ItemID,ItemID,ItemID,ItemID,ItemID,ItemID];
    active: HotbarSlotIndex;
    readonly held_item: ItemID;
  }

  declare speed: number;

  constructor() {
    super();

    // Inherit all properties defined inside of the Player JSON file
    for (const property in entity.player){
      // @ts-ignore
      this[property] = entity.player[property];
    }

    // Define properties only used internally by the game that don't need to be in the source file
    this.animation.tick = 0;
    this.animation.frame = 0;
    this.animation.column = 0;

    Object.defineProperty(this.hotbar,"held_item",{ get: () => this.hotbar.slots[this.hotbar.active] });
  }

  getEntityOverlap(): void {
    const rect1 = this.getBoundingClientRect();
    for (const tree of treesArray){
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
    // @ts-expect-error - this might be causing the gamepad crashes
    const gamepad = navigator.getGamepads()[gamepads[0]];

    let [axisX,axisY] = (gamepad) ? gamepad.axes : [null,null,null,null], [left1,right1] = (gamepad) ? [gamepad.buttons[4].value,gamepad.buttons[5].value] : [null,null];

    if (gamepad){
      key.left = (Math.round(axisX as number * 1000) < 0);
      key.right = (Math.round(axisX as number * 1000) > 0);
      key.up = (Math.round(axisY as number * 1000) < 0);
      key.down = (Math.round(axisY as number * 1000) > 0);

      let active: HotbarSlotIndex = parseInt(hotbar.querySelector<ItemSlot>("item-slot[active]")!.getAttribute("slot") as string) as HotbarSlotIndex;

      if (left1 && !right1 && tick % 10 == 0){
        hotbar.setSlot(((active - 1 > 0) ? active - 1 : 6) as HotbarSlotIndex);
      }
      if (right1 && !left1 && tick % 10 == 0){
        hotbar.setSlot(((active + 1 < 7) ? active + 1 : 1) as HotbarSlotIndex);
      }
    }

    const { left, right, up, down } = key;
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

    if (key.left && !key.right){
      this.direction.horizontal = "left";
    }
    if (key.right && !key.left){
      this.direction.horizontal = "right";
    }

    if (key.down && !key.up && !key.left && !key.right){
      this.direction.vertical = "down";
    }
    if (key.up && !key.down && !key.left && !key.right){
      this.direction.vertical = "up";
    }
    if (!key.up && !key.down || key.left || key.right){
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

    if ((key.left && !key.right) || (key.right && !key.left) || (key.up && !key.down) || (key.down && !key.up)){
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

    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,-7,14);

    ctx.drawImage(entity.shadow.texture.image,0,0,this.box.width - 2,4);
    if (this.direction.vertical === "down"){
      this.drawCharacter(scale,offset);
      this.drawItem(scale,itemScale);
    } else {
      this.drawItem(scale,itemScale);
      this.drawCharacter(scale,offset);
    }

    ctx.setTransform(1,0,0,1,0,0);
  }

  drawItem(scale: number, itemScale: number): void {
    const definition = item[this.hotbar.held_item] as UnionToIntersection<typeof item[typeof this.hotbar.held_item]>;
    let { naturalWidth: width, naturalHeight: height } = definition.texture.image;
    if (definition.animation){
      height /= definition.animation.keyframes;
    }

    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.box.width / -2 + 1,this.box.height / -2);
    ctx.transform(1,0,0,1,10,5);

    if (definition.texture.directional !== false){
      ctx.scale(-1 * itemScale,1);
      ctx.transform(1,0,0,1,-width,height);
      ctx.rotate(Math.PI * -1 / 2);
    } else {
      ctx.transform(1,0,0,1,-1,-1);
      ctx.scale(itemScale,1);
    }

    let keyframe = 0;
    if (definition.animation){
      const current = tick / 60 * 1000;
      const { duration, keyframes } = definition.animation;
      keyframe = Math.floor((current % duration) / duration * keyframes) * height;
    }

    ctx.drawImage(definition.texture.image,0,keyframe,width,height,this.direction.vertical ? this.direction.vertical === "up" ? -2 : -1 : 0,1,width,height);
  }

  drawCharacter(scale: number, offset: number): void {
    ctx.setTransform(this.direction.horizontal === "left" && !this.direction.vertical ? -1 : 1,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.box.width / -2 + offset,this.box.height / -2);
    ctx.drawImage(entity.player.texture.image,this.box.width * (this.animation.column !== 0 ? this.animation.frame : 0),this.box.height * this.animation.column,this.box.width,this.box.height,0,0,this.box.width,this.box.height);
  }
}