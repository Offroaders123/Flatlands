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

export abstract class Entity {
  x = 0;
  y = 0;

  abstract box: {
    width: number;
    height: number;
  };

  abstract texture: {
    source: string;
  };

  getBoundingClientRect(): BoundingClientRect {
    const { x, y, x: left, y: top } = this;
    const { width, height } = this.box;
    const right = x + width, bottom = y + height;
    return { left, top, right, bottom, x, y, width, height };
  }
}