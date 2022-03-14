import { ctx, offsetX, offsetY } from "./canvas.js";
import { key } from "./input.js";
import { terrain } from "./properties.js";
import { explored, player } from "./app.js";

export default class Tree {
  constructor(){
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
    this.width = 96;
    this.height = 192;
  }
  draw(){
    ctx.drawImage((terrain && terrain["tree"].texture.image) ? terrain["tree"].texture.image : missingTextureSprite,this.x + player.x + offsetX(),this.y + player.y + offsetY(),this.width,this.height);
  }
}