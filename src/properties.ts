import { ctx } from "./canvas.js";

export interface BaseDefinition {
  name: string;
  texture: {
    width?: number;
    height?: number;
    source: string;
    image: HTMLImageElement;
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

const definitions: Definitions = {
  entity: {
    player: {
      name: "Player",
      box: {
        width: 16,
        height: 32
      },
      texture: {
        source: "textures/entity/player/guy.png",
        image: missingTextureSprite
      },
      animation: {
        type: "reactive",
        duration: 24,
        keyframes: 2,
        columns: 4,
        tick: 0,
        frame: 0,
        column: 0
      },
      direction: {
        horizontal: "right",
        vertical: false
      },
      hotbar: {
        slots: [
          "spearsword",
          "pickmatic",
          "hatchet",
          "spade",
          "fire",
          "pizza"
        ],
        active: 4
      },
      speed: 2
    },
    shadow: {
      name: "Shadow",
      texture: {
        source: "textures/entity/shadow.png",
        image: missingTextureSprite
      }
    }
  },
  item: {
    fire: {
      name: "Fire",
      texture: {
        source: "textures/item/fire.png",
        image: missingTextureSprite,
        directional: false
      },
      animation: {
        type: "repeat",
        duration: 750,
        keyframes: 4
      }
    },
    hatchet: {
      name: "Hatchet",
      texture: {
        source: "textures/item/hatchet.png",
        image: missingTextureSprite
      }
    },
    pickmatic: {
      name: "Pickmatic",
      texture: {
        source: "textures/item/pickmatic.png",
        image: missingTextureSprite
      }
    },
    pizza: {
      name: "Pizza",
      texture: {
        source: "textures/item/pizza.png",
        image: missingTextureSprite,
        directional: false
      }
    },
    spade: {
      name: "Spade",
      texture: {
        source: "textures/item/spade.png",
        image: missingTextureSprite
      }
    },
    spearsword: {
      name: "Spearsword",
      texture: {
        source: "textures/item/spearsword.png",
        image: missingTextureSprite
      }
    }
  },
  terrain: {
    ground: {
      name: "Ground",
      texture: {
        source: "textures/terrain/ground.png",
        image: missingTextureSprite
      }
    } as Ground,
    tree: {
      name: "Tree",
      box: {
        width: 96,
        height: 192
      },
      texture: {
        source: "textures/terrain/tree.png",
        image: missingTextureSprite
      }
    }
  }
};

await Promise.all((Object.values(definitions) as Definitions[keyof Definitions][]).map(async definition => {
  await Promise.all((Object.values(definition) as UnionToIntersection<typeof definition>[keyof UnionToIntersection<typeof definition>][]).map(async feature => {
    const { source } = feature.texture;
    const image = await loadSprite(source);
    if (image !== null){
      feature.texture.image = image;
    }
  }));
}));

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