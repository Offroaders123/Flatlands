import Entity from "./Entity.js";
import { tick, treesArray } from "./app.js";
import { ctx, offsetX, offsetY } from "./canvas.js";
import { key, gamepads } from "./input.js";
import { entity, item } from "./properties.js";

export default class Player extends Entity {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.width = 16;
    this.height = 32;
    this.speed = 2;
    this.tick = 0;
    this.ticks = 24;
    this.frame = 0;
    this.frames = 2;
    this.column = 0;
    this.columns = 4;
    this.directionX = "right";
    this.directionY = false;
    this.held_item = "hatchet";
  }
  getEntityOverlap() {
    const rect1 = this.getBoundingClientRect();
    treesArray.forEach(tree => {
      const rect2 = tree.getBoundingClientRect();
      const overlap =
        (-rect1.top <= rect2.bottom &&
         -rect1.bottom >= rect2.top &&
         -rect1.left <= rect2.right &&
         -rect1.right >= rect2.left);
      tree.overlapRender = overlap;
    });
  }
  update() {
    this.getEntityOverlap();
    const gamepad = navigator.getGamepads()[gamepads[0]];
    let [axisX,axisY] = (gamepad) ? gamepad.axes : [null,null,null,null], [left1,right1] = (gamepad) ? [gamepad.buttons[4].value,gamepad.buttons[5].value] : [null,null];
    if (gamepad){
      key.left = (Math.round(axisX * 1000) < 0);
      key.right = (Math.round(axisX * 1000) > 0);
      key.up = (Math.round(axisY * 1000) < 0);
      key.down = (Math.round(axisY * 1000) > 0);
      let active = parseInt(hotbar.querySelector("item-slot[active]").getAttribute("slot"));
      if (left1 && !right1 && tick % 10 == 0) hotbar.setSlot((active - 1 > 0) ? active - 1 : 6);
      if (right1 && !left1 && tick % 10 == 0) hotbar.setSlot((active + 1 < 7) ? active + 1 : 1);
    }

    const { left, right, up, down } = key;
    const cardinal = this.speed;

    /* Cardinals */
    if (left && !right) this.x += cardinal * (-axisX || 1);
    if (right && !left) this.x -= cardinal * (axisX || 1);
    if (up && !down) this.y += cardinal * (-axisY || 1);
    if (down && !up) this.y -= cardinal * (axisY || 1);

    if (key.left && !key.right) this.directionX = "left";
    if (key.right && !key.left) this.directionX = "right";

    if (key.down && !key.up && !key.left && !key.right) this.directionY = "down";
    if (key.up && !key.down && !key.left && !key.right) this.directionY = "up";
    if (!key.up && !key.down || key.left || key.right) this.directionY = false;

    if (this.directionY == "down") this.column = 2;
    if (this.directionY == "up") this.column = 3;
    if (!this.directionY) this.column = 1;

    if ((key.left && !key.right) || (key.right && !key.left) || (key.up && !key.down) || (key.down && !key.up)){
      this.tick++;
    } else {
      this.column = 0;
      this.directionY = false;
    }
    if (this.tick > this.ticks - 1){
      this.tick = 0;
      (this.frame < this.frames - 1) ? this.frame++ : this.frame = 0;
    }
  }
  draw() {
    let heldItemTexture = (this.held_item !== null && item) ? item[this.held_item].texture : null;
    let scale = 1, offset = 1, itemScale = 1;

    if (this.directionX == "left" && this.directionY != "up"){
      scale = -1;
    }
    if (this.directionX == "right" && this.directionY == "up"){
      scale = -1;
    }
    if (this.directionX == "right" && this.directionY){
      offset = 0;
    }
    if (this.directionY){
      itemScale = 2/3;
    }

    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,-7,14);
    if (entity && entity.shadow.texture.image) ctx.drawImage(entity.shadow.texture.image,0,0,this.width - 2,4);
    if (this.directionY == "down"){
      this.drawCharacter(scale,offset);
      this.drawItem(heldItemTexture,scale,itemScale);
    } else {
      this.drawItem(heldItemTexture,scale,itemScale);
      this.drawCharacter(scale,offset);
    }

    ctx.setTransform(1,0,0,1,0,0);
  }
  drawItem(heldItemTexture,scale,itemScale) {
    if (heldItemTexture === null) return;
    let { image: itemSprite } = heldItemTexture;

    const { frames } = heldItemTexture;
    let { naturalWidth, naturalHeight } = itemSprite;
    if (frames){
      const { width, height } = heldItemTexture;
      naturalWidth = width;
      naturalHeight = height;
    }

    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.width / -2 + 1,this.height / -2);
    ctx.transform(1,0,0,1,naturalWidth * 0.625,naturalHeight * 0.3125);
    ctx.scale(-1 * itemScale,1);
    ctx.transform(1,0,0,1,-naturalWidth,naturalHeight);
    ctx.rotate(Math.PI * -1 / 2);
    //ctx.fillStyle = "#00ff0030";
    //ctx.fillRect((this.directionY) ? (this.directionY == "up") ? -2 : -1 : 0,1,naturalWidth,naturalHeight);

    const sy = 0;/* This is where the item keyframe eventually will be calculated */

    ctx.drawImage(itemSprite,0,sy,naturalWidth,naturalHeight,(this.directionY) ? (this.directionY == "up") ? -2 : -1 : 0,1,naturalWidth,naturalHeight);
  }
  drawCharacter(scale,offset) {/* Mob idea name: ooogr */
    let charSprite = entity.player.texture.image;
    ctx.setTransform((this.directionX == "left" && !this.directionY) ? -1 : 1,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.width / -2 + offset,this.height / -2);
    ctx.drawImage(charSprite,this.width * ((this.column != 0) ? this.frame : 0),this.height * this.column,this.width,this.height,0,0,this.width,this.height);
  }
}