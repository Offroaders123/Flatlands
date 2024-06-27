// properties.js

// import { ctx } from "./canvas.js";

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
  texture: {
    width?: number;
    height?: number;
    source: string;
    image?: HTMLImageElement;
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
  tick: number;
  frame: number;
  column: number;
}

export interface RepeatAnimation {
  type: "repeat";
  duration: number;
  keyframes: number;
}

export interface Fire extends AnimatedDefinition {
  texture: BaseDefinition["texture"] & {
    directional: false;
  };
  animation: RepeatAnimation;
}

export interface Ground extends BaseDefinition {
  texture: BaseDefinition["texture"] & {
    pattern: CanvasPattern | null;
  };
}

export interface Definitions {
  entity: Entity;
  item: Item;
  terrain: Terrain;
}

export interface Entity {
  player: BaseDefinition;
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
  tree: BaseDefinition;
}

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export const missingTextureSprite = new Image();
// const missingTextureSprite = new ImageData(new Uint8ClampedArray([249,0,255,255,0,0,0,255,0,0,0,255,249,0,255,255]),2,2);
missingTextureSprite.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAlwSFlz\
AAALEwAACxMBAJqcGAAAAAZQTFRF+QD/AAAASf/37wAAAAxJREFUeJxjcGBoAAABRADBOnocVgAAAABJRU5ErkJggg==`;

const definitions: Definitions = {
  entity: {
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
  } satisfies Entity,
  item: {
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
  } satisfies Item,
  terrain: {
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
  } satisfies Terrain
};

async function loadDefinitions(definitions: Definitions, ctx: CanvasRenderingContext2D): Promise<void> {
  await Promise.all<void[]>(
    (Object.values(definitions) as Definitions[keyof Definitions][])
      .map(definition => Promise.all<void>(
        Object.values(definition)
          .map(feature => loadFeature(feature, ctx))
      ))
  ) satisfies void[][];
}

async function loadFeature(feature: BaseDefinition, ctx: CanvasRenderingContext2D): Promise<void> {
  const { source } = feature.texture;
  const image = await loadSprite(source);
  if (image === null) return;
  feature.texture.image = image;
  if (feature.name !== "Ground") return;
  if (ctx === undefined) return;
  (feature as Ground).texture.pattern = ctx.createPattern(image, "repeat")!;
}

// await loadDefinitions(definitions, ctx);

export const { entity, item, terrain } = definitions;
// item = definitions.item;

export async function loadSprite(source: string): Promise<HTMLImageElement | null> {
  return new Promise<HTMLImageElement | null>(resolve => {
    const sprite = new Image();
    sprite.addEventListener("load",() => resolve(sprite));
    sprite.addEventListener("error",() => resolve(null));
    sprite.src = source;
  });
}