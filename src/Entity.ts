export class Entity {
  x = 0;
  y = 0;

  declare box: {
    width: number;
    height: number;
  };

  declare texture: {
    source: string;
  };

  getBoundingClientRect() {
    const { x, y, x: left, y: top } = this;
    const { width, height } = this.box;
    const right = x + width, bottom = y + height;
    return { left, top, right, bottom, x, y, width, height };
  }
}