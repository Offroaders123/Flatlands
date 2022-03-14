import { ctx, offsetX, offsetY } from "./canvas.js";
import { key, gamepads } from "./input.js";
import { missingTextureSprite, entities, items } from "./properties.js";

export default class Player {
  constructor(){
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
  update(){
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
    if (key.left && !key.right) this.x += this.speed * (-axisX || 1);
    if (key.right && !key.left) this.x -= this.speed * (axisX || 1);
    if (key.up && !key.down) this.y += this.speed * (-axisY || 1);
    if (key.down && !key.up) this.y -= this.speed * (axisY || 1);

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
  draw(){
    let heldItemImage = (this.held_item !== null) ? (items && items[this.held_item].texture.image) ? items[this.held_item].texture.image : undefined : null;
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
    if (entities && entities["shadow"].texture.image) ctx.drawImage(entities["shadow"].texture.image,0,0,this.width - 2,4);
    if (this.directionY == "down"){
      this.drawCharacter(scale,offset);
      this.drawItem(heldItemImage,scale,itemScale);
    } else {
      this.drawItem(heldItemImage,scale,itemScale);
      this.drawCharacter(scale,offset);
    }

    ctx.setTransform(1,0,0,1,0,0);
  }
  drawItem(itemSprite,scale,itemScale){
    if (itemSprite === null) return;
    if (!itemSprite) itemSprite = missingTextureSprite;
    const cachedSprite = (itemSprite !== missingTextureSprite);
    ctx.setTransform(scale,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.width / -2 + 1,this.height / -2);
    ctx.transform(1,0,0,1,((cachedSprite) ? itemSprite.naturalWidth : 16) * 0.625,((cachedSprite) ? itemSprite.naturalHeight : 16) * 0.3125);
    ctx.scale(-1 * itemScale,1);
    ctx.transform(1,0,0,1,-((cachedSprite) ? itemSprite.naturalWidth : 16),((cachedSprite) ? itemSprite.naturalHeight : 16));
    ctx.rotate(Math.PI * -1 / 2);
    //ctx.fillStyle = "#00ff0030";
    //ctx.fillRect((this.directionY) ? (this.directionY == "up") ? -2 : -1 : 0,1,itemSprite.naturalWidth,itemSprite.naturalHeight);
    ctx.drawImage(itemSprite,(this.directionY) ? (this.directionY == "up") ? -2 : -1 : 0,1,(cachedSprite) ? itemSprite.naturalWidth : 16,(cachedSprite) ? itemSprite.naturalHeight : 16);
  }
  drawCharacter(scale,offset){/* Mob idea name: ooogr */
    const cachedSprite = (entities && entities["player"].texture.image);
    let charSprite = (cachedSprite) ? entities["player"].texture.image : missingTextureSprite;
    ctx.setTransform((this.directionX == "left" && !this.directionY) ? -1 : 1,0,0,1,offsetX(),offsetY());
    ctx.transform(1,0,0,1,this.width / -2 + offset,this.height / -2);
    if ( cachedSprite) ctx.drawImage(charSprite,this.width * ((this.column != 0) ? this.frame : 0),this.height * this.column,this.width,this.height,0,0,this.width,this.height);
    if (!cachedSprite) ctx.drawImage(charSprite,0,0,this.width,this.height);
  }
}