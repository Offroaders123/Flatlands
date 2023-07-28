import { ctx } from "./canvas.js";

export interface BaseDefinition {
  name: string;
  texture: {
    width?: number;
    height?: number;
    source: string;
    readonly image: HTMLImageElement;
    directional?: false;
  };
}

export interface AnimatedDefinition extends BaseDefinition {
  animation: Animation;
}

export type Animation = ReactiveAnimation | RepeatAnimation;

export interface ReactiveAnimation {
  type: "reactive";
  duration: number;
  keyframes: number;
  columns: number;
}

export interface RepeatAnimation {
  type: "repeat";
  duration: number;
  keyframes: number;
}

export interface Player extends AnimatedDefinition {
  box: {
    width: 16;
    height: 32;
  };
  animation: ReactiveAnimation;
  direction: {
    horizontal: string;
    vertical: false | "down" | "up";
  };
  hotbar: {
    slots: [ItemID,ItemID,ItemID,ItemID,ItemID,ItemID];
    active: number;
  };
  speed: number;
}

export interface Fire extends AnimatedDefinition {
  texture: BaseDefinition["texture"] & {
    directional: false;
  };
  animation: RepeatAnimation;
}

export interface Ground extends BaseDefinition {
  texture: BaseDefinition["texture"] & {
    pattern: CanvasPattern;
  };
}

export interface Tree extends BaseDefinition {
  box: {
    width: number;
    height: number;
  };
}

export interface Definitions {
  entity: Entity;
  item: Item;
  terrain: Terrain;
}

export type DefinitionSrc = {
  [K in keyof Definitions]: (Definitions[K][keyof Definitions[K]])[];
};

export type DefinitionFile = {
  [K in keyof DefinitionSrc]: string[];
};

export interface FeatureFile {
  [id: string]: DefinitionSrc[keyof DefinitionSrc][number];
}

export interface Entity {
  player: Player;
  shadow: BaseDefinition;
}

export interface Item {
  fire: Fire;
  hatchet: BaseDefinition;
  pickmatic: BaseDefinition;
  pizza: BaseDefinition;
  spade: BaseDefinition;
  spearsword: BaseDefinition;
}

export type ItemID = keyof Item;

export interface Terrain {
  ground: Ground;
  tree: Tree;
}

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

const missingTextureSprite = new Image();
// const missingTextureSprite = new ImageData(new Uint8ClampedArray([249,0,255,255,0,0,0,255,0,0,0,255,249,0,255,255]),2,2);
missingTextureSprite.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF+QD/AAAASf/37wAAAAxJREFUeJxjcGBoAAABRADBOnocVgAAAABJRU5ErkJggg==";

const definitionFile: DefinitionFile = await fetch("features/definitions.json").then(response => response.json());
const definitions = {} as Definitions;

for (const definition in definitionFile){
  const entries = definitionFile[definition as keyof typeof definitionFile];
  definitions[definition as keyof typeof definitionFile] = {} as UnionToIntersection<typeof definitions[keyof typeof definitions]>;

  for (const value of entries){
    const feature: FeatureFile = await fetch(`features/${definition as keyof typeof definitionFile}/${value}`).then(response => response.json());
    const [key] = Object.keys(feature);

    Object.assign(definitions[definition as keyof typeof definitionFile],feature);
    // @ts-expect-error - indexing
    const { source } = definitions[definition as keyof typeof definitionFile][key].texture;
    const image = await loadSprite(source);

    // @ts-expect-error
    Object.defineProperty(definitions[definition as keyof typeof definitionFile][key].texture,"image",{
      get() {
        return (image) ? image : missingTextureSprite;
      }
    });
  }
}

definitions.terrain.ground.texture.pattern = ctx.createPattern(definitions.terrain.ground.texture.image,"repeat")!;

export const { entity, item, terrain } = definitions;

async function loadSprite(source: string): Promise<HTMLImageElement | null> {
  return new Promise<HTMLImageElement | null>(resolve => {
    const sprite = new Image();
    sprite.addEventListener("load",() => resolve(sprite));
    sprite.addEventListener("error",() => resolve(null));
    sprite.src = source;
  });
}