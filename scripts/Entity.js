export default class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
  getBoundingClientRect() {
    const { x, y, x: left, y: top } = this;
    const { width, height } = this.box;
    const right = x + width, bottom = y + height;
    return { left, top, right, bottom, x, y, width, height };
  }
}