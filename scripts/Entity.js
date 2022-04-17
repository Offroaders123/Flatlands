export default class Entity {
  getBoundingClientRect() {
    const { x, y, width, height, x: left, y: top } = this;
    const right = x + width, bottom = y + height;
    return { left, top, right, bottom, x, y, width, height };
  }
}