// Entity.js

export interface BoundingClientRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default abstract class EntityAbstract {
  x = 0;
  y = 0;

  abstract box: {
    width: number;
    height: number;
  };

  abstract texture: {
    source: string;
    image?: HTMLImageElement;
  };

  getBoundingClientRect(): BoundingClientRect {
    const { x, y, x: left, y: top } = this;
    const { width, height } = this.box;
    const right = x + width, bottom = y + height;
    return { left, top, right, bottom, x, y, width, height };
  }
}