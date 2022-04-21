import Entity from "./Entity.js";
import { tick, treesArray } from "./app.js";
import { ctx, offsetX, offsetY } from "./canvas.js";
import { key, gamepads } from "./input.js";
import { entity, item } from "./properties.js";

export default class Player extends Entity {
  constructor() {
    super();

    // Inherit all properties defined inside of the Player JSON file
    for (const property in entity.player){
      this[property] = entity.player[property];
    }

    // Define properties only used internally by the game that don't need to be in the source file
    this.animation.tick = 0;
    this.animation.frame = 0;
    this.animation.column = 0;

    Object.defineProperty(this.hotbar,"held_item",{ get: () => this.hotbar.slots[this.hotbar.active] });
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

    if (key.left && !key.right) this.direction.horizontal = "left";
    if (key.right && !key.left) this.direction.horizontal = "right";

    if (key.down && !key.up && !key.left && !key.right) this.direction.vertical = "down";
    if (key.up && !key.down && !key.left && !key.right) this.direction.vertical = "up";
    if (!key.up && !key.down || key.left || key.right) this.direction.vertical = false;

    if (this.direction.vertical == "down") this.animation.column = 2;
    if (this.direction.vertical == "up") this.animation.column = 3;
    if (!this.direction.vertical) this.animation.column = 1;

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
  draw() {
    let heldItemTexture = (this.hotbar.held_item !== null && item) ? item[this.hotbar.held_item].texture : null;
    let scale = 1, offset = 1, itemScale = 1;

    if (this.direction.horizontal == "left" && this.direction.vertical != "up"){
      scale = -1;
    }
    if (this.direction.horizontal == "right" && this.direction.vertical == "up"){
      scale = -1;
    }
    if (this.direction.horizontal == "right" && this.direction.vertical){
      offset = 0;
    }
    if (this.direction.vertical){
      itemScale = 2/3;
    }

    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,-7,14);
    if (entity && entity.shadow.texture.image) ctx.drawImage(entity.shadow.texture.image,0,0,this.box.width - 2,4);
    if (this.direction.vertical == "down"){
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
    ctx.transform(1,0,0,1,this.box.width / -2 + 1,this.box.height / -2);
    ctx.transform(1,0,0,1,naturalWidth * 0.625,naturalHeight * 0.3125);
    ctx.scale(-1 * itemScale,1);
    ctx.transform(1,0,0,1,-naturalWidth,naturalHeight);
    ctx.rotate(Math.PI * -1 / 2);
    //ctx.fillStyle = "#00ff0030";
    //ctx.fillRect((this.direction.vertical) ? (this.direction.vertical == "up") ? -2 : -1 : 0,1,naturalWidth,naturalHeight);

    const sy = 0;/* This is where the item keyframe eventually will be calculated */

    ctx.drawImage(itemSprite,0,sy,naturalWidth,naturalHeight,(this.direction.vertical) ? (this.direction.vertical == "up") ? -2 : -1 : 0,1,naturalWidth,naturalHeight);
  }
  drawCharacter(scale,offset) {/* Mob idea name: ooogr */
    let charSprite = entity.player.texture.image;
    ctx.setTransform((this.direction.horizontal == "left" && !this.direction.vertical) ? -1 : 1,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.box.width / -2 + offset,this.box.height / -2);
    ctx.drawImage(charSprite,this.box.width * ((this.animation.column != 0) ? this.animation.frame : 0),this.box.height * this.animation.column,this.box.width,this.box.height,0,0,this.box.width,this.box.height);
  }
}