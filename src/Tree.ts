import { Entity } from "./Entity.js";
import { canvas, ctx, offsetX, offsetY } from "./canvas.js";
import { key } from "./input.js";
import { terrain } from "./properties.js";
import { debug_toggle, explored, player } from "./app.js";

export class Tree extends Entity {
  declare overlapRender: boolean;

  constructor() {
    super();

    // Inherit all properties defined inside of the Tree JSON file
    for (const property in terrain.tree){
      // @ts-ignore
      this[property] = terrain.tree[property];
    }

    this.x = Math.floor(Math.random() * canvas.width) - Math.floor(canvas.width / 2) - player.x - 96 / 2;
    //this.y = Math.floor(Math.random() * canvas.height) - canvas.height / 2 - player.y - 192 / 2;
    if (key.up && !key.down){
      this.y = - player.y - offsetY() - 192;
      if (explored.top > this.y) explored.top = this.y;
    }
    if (key.down && !key.up){
      this.y = canvas.height - player.y - offsetY();
      if (explored.bottom < this.y) explored.bottom = this.y;
    }
  }

  draw(): void {
    if (this.overlapRender && debug_toggle.checked){
      ctx.fillStyle = "#f00";
      ctx.fillRect(this.x + player.x + offsetX(),this.y + player.y + offsetY(),this.box.width,this.box.height);
    }
    ctx.drawImage(terrain.tree.texture.image,this.x + player.x + offsetX(),this.y + player.y + offsetY(),this.box.width,this.box.height);
  }
}