import playerTexture from "/textures/entity/player/guy.png";
import shadowTexture from "/textures/entity/shadow.png";
import fireTexture from "/textures/item/fire.png";
import hatchetTexture from "/textures/item/hatchet.png";
import pickmaticTexture from "/textures/item/pickmatic.png";
import pizzaTexture from "/textures/item/pizza.png";
import spadeTexture from "/textures/item/spade.png";
import spearswordTexture from "/textures/item/spearsword.png";
import groundTexture from "/textures/terrain/ground.png";
import treeTexture from "/textures/terrain/tree.png";

export interface BaseDefinition {
  name: string;
  texture: Texture;
}

export interface Texture {
  width?: number;
  height?: number;
  source: string;
  image?: HTMLImageElement;
  directional?: false;
}

export interface AnimatedDefinition<T extends Animation> {
  animation: T;
}

export type Animation = ReactiveAnimation | RepeatAnimation;

export interface ReactiveAnimation {
  type: "reactive";
  duration: number;
  keyframes: number;
  columns: number;
  tick: number;
  frame: number;
  column: number;
}

export interface RepeatAnimation {
  type: "repeat";
  duration: number;
  keyframes: number;
}

export interface Fire extends BaseDefinition, AnimatedDefinition<RepeatAnimation> {
  texture: Texture & {
    directional: false;
  };
}

export interface Ground extends BaseDefinition {
  texture: Texture & {
    pattern: CanvasPattern | null;
  };
}

export interface EntityNameMap {
  player: BaseDefinition;
  shadow: BaseDefinition;
}

export interface ItemNameMap {
  fire: Fire;
  hatchet: BaseDefinition;
  pickmatic: BaseDefinition;
  pizza: BaseDefinition;
  spade: BaseDefinition;
  spearsword: BaseDefinition;
}

export type ItemID = keyof ItemNameMap;

export interface TerrainNameMap {
  ground: Ground;
  tree: BaseDefinition;
}

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export const missingTextureSprite = new Image();
// const missingTextureSprite = new ImageData(new Uint8ClampedArray([249,0,255,255,0,0,0,255,0,0,0,255,249,0,255,255]),2,2);
missingTextureSprite.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAlwSFlz\
AAALEwAACxMBAJqcGAAAAAZQTFRF+QD/AAAASf/37wAAAAxJREFUeJxjcGBoAAABRADBOnocVgAAAABJRU5ErkJggg==`;

export const entity: EntityNameMap = {
    player: {
      name: "Player",
      texture: {
        source: playerTexture
      }
    } satisfies BaseDefinition,
    shadow: {
      name: "Shadow",
      texture: {
        source: shadowTexture
      }
    } satisfies BaseDefinition
  };

export const item: ItemNameMap = {
    fire: {
      name: "Fire",
      texture: {
        source: fireTexture,
        directional: false
      },
      animation: {
        type: "repeat",
        duration: 750,
        keyframes: 4
      }
    } satisfies Fire,
    hatchet: {
      name: "Hatchet",
      texture: {
        source: hatchetTexture
      }
    } satisfies BaseDefinition,
    pickmatic: {
      name: "Pickmatic",
      texture: {
        source: pickmaticTexture
      }
    } satisfies BaseDefinition,
    pizza: {
      name: "Pizza",
      texture: {
        source: pizzaTexture,
        directional: false
      }
    } satisfies BaseDefinition,
    spade: {
      name: "Spade",
      texture: {
        source: spadeTexture
      }
    } satisfies BaseDefinition,
    spearsword: {
      name: "Spearsword",
      texture: {
        source: spearswordTexture
      }
    } satisfies BaseDefinition
  };

export const terrain: TerrainNameMap = {
    ground: {
      name: "Ground",
      texture: {
        source: groundTexture,
        pattern: null // ctx.createPattern(missingTextureSprite, "repeat")!
      }
    } satisfies Ground,
    tree: {
      name: "Tree",
      texture: {
        source: treeTexture
      }
    } satisfies BaseDefinition
  };

export async function loadDefinitions(ctx: CanvasRenderingContext2D): Promise<void> {
  await Promise.all<void[]>(
    ([entity, item, terrain])
      .map(definition => Promise.all<void>(
        (Object.values(definition) as (EntityNameMap[keyof EntityNameMap] | ItemNameMap[keyof ItemNameMap] | TerrainNameMap[keyof TerrainNameMap])[])
          .map(feature => loadFeature(feature, ctx))
      ))
  ) satisfies void[][];
}

export async function loadFeature(feature: BaseDefinition, ctx: CanvasRenderingContext2D): Promise<void> {
  const { source } = feature.texture;
  const image = await loadSprite(source);
  if (image === null) return;
  feature.texture.image = image;
  if (feature.name !== "Ground") return;
  if (ctx === undefined) return;
  (feature as Ground).texture.pattern = ctx.createPattern(image, "repeat")!;
}

export async function loadSprite(source: string): Promise<HTMLImageElement | null> {
  return new Promise<HTMLImageElement | null>(resolve => {
    const sprite = new Image();
    sprite.addEventListener("load",() => resolve(sprite));
    sprite.addEventListener("error",() => resolve(null));
    sprite.src = source;
  });
}