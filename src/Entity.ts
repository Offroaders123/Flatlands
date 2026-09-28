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

export interface EntityAbstract {
  x: number;
  y: number;

  box: {
    width: number;
    height: number;
  };

  texture: {
    source: string;
    image?: HTMLImageElement;
  };
}

export function getBoundingClientRect(entity: EntityAbstract): BoundingClientRect {
  const { x, y, x: left, y: top } = entity;
  const { width, height } = entity.box;
  const right = x + width, bottom = y + height;
  return { left, top, right, bottom, x, y, width, height };
}
