import EntityAbstract from "./Entity.js";
import { missingTextureSprite, terrain } from "./properties.js";

import type { Accessor } from "solid-js";
import type Player from "./Player.js";
import type { KeyState } from "./input.js";

export default class Tree extends EntityAbstract {
  name = "Tree";
  box = {
    width: 96,
    height: 192
  };
  texture = terrain.tree.texture;

  overlapRender: boolean = false;

  constructor(private readonly player: Player, private readonly explored: { left: number; right: number; top: number; bottom: number; }, private readonly offsetX: () => number, private readonly offsetY: () => number, private readonly key: KeyState, private readonly canvas: HTMLCanvasElement, private readonly ctx: CanvasRenderingContext2D, private readonly getDebugEnabled: Accessor<boolean>) {
    super();

    this.x = Math.floor(Math.random() * this.canvas!.width) - Math.floor(this.canvas!.width / 2) - this.player!.x - 96 / 2;
    //this.y = Math.floor(Math.random() * this.canvas!.height) - this.canvas!.height / 2 - player!.y - 192 / 2;
    if (this.key.up && !this.key.down){
      this.y = - this.player!.y - this.offsetY() - 192;
      if (this.explored.top > this.y) this.explored.top = this.y;
    }
    if (this.key.down && !this.key.up){
      this.y = this.canvas!.height - this.player!.y - this.offsetY();
      if (this.explored.bottom < this.y) this.explored.bottom = this.y;
    }
  }

  draw(): void {
    if (this.overlapRender && this.getDebugEnabled()){
      this.ctx.fillStyle = "#f00";
      this.ctx.fillRect(this.x + this.player!.x + this.offsetX(),this.y + this.player!.y + this.offsetY(),this.box.width,this.box.height);
    }
    this.ctx.drawImage(this.texture.image ?? missingTextureSprite,this.x + this.player!.x + this.offsetX(),this.y + this.player!.y + this.offsetY(),this.box.width,this.box.height);
  }
}