import { Entity } from "./Entity.js";
import { canvas, ctx, offsetX, offsetY } from "./canvas.js";
import { key } from "./input.js";
import { loadSprite, missingTextureSprite } from "./properties.js";
import { debug_toggle, explored, player } from "./app.js";

export class Tree extends Entity {
  name = "Tree";
  box = {
    width: 96,
    height: 192
  };
  texture = {
    source: "textures/terrain/tree.png",
    image: missingTextureSprite
  };

  overlapRender: boolean = false;

  constructor() {
    super();

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

    loadSprite(this.texture.source).then(sprite => {
      if (sprite === null) return;
      this.texture.image = sprite;
    });
  }

  draw(): void {
    if (this.overlapRender && debug_toggle.checked){
      ctx.fillStyle = "#f00";
      ctx.fillRect(this.x + player.x + offsetX(),this.y + player.y + offsetY(),this.box.width,this.box.height);
    }
    ctx.drawImage(this.texture.image,this.x + player.x + offsetX(),this.y + player.y + offsetY(),this.box.width,this.box.height);
  }
}