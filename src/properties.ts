import { ctx } from "./canvas.js";

export interface BaseDefinition {
  name: string;
  texture: {
    source: string;
    readonly image: HTMLElement;
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
    slots: [string,string,string,string,string,string];
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
  entity: {
    player: Player;
    shadow: BaseDefinition;
  };
  item: {
    fire: Fire;
    hatchet: BaseDefinition;
    pickmatic: BaseDefinition;
    pizza: BaseDefinition;
    spade: BaseDefinition;
    spearsword: BaseDefinition;
  };
  terrain: {
    ground: Ground;
    tree: Tree;
  };
};

const missingTextureSprite = new Image();
missingTextureSprite.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF+QD/AAAASf/37wAAAAxJREFUeJxjcGBoAAABRADBOnocVgAAAABJRU5ErkJggg==";

const definitions = await fetch("features/definitions.json").then(response => response.json());

for (const definition in definitions){
  const entries = definitions[definition];
  definitions[definition] = {};

  for (const value of entries){
    const feature = await fetch(`features/${definition}/${value}`).then(response => response.json());
    const [key] = Object.keys(feature);

    Object.assign(definitions[definition],feature);
    const { source } = definitions[definition][key].texture;
    const image = await loadSprite(source);

    Object.defineProperty(definitions[definition][key].texture,"image",{
      get() {
        return (image) ? image : missingTextureSprite;
      }
    });
  }
}

definitions.terrain.ground.texture.pattern = ctx.createPattern(definitions.terrain.ground.texture.image,"repeat");

export const { entity, item, terrain } = definitions;

function loadSprite(source: string){
  return new Promise<HTMLImageElement | null>(resolve => {
    const sprite = new Image();
    sprite.addEventListener("load",() => resolve(sprite));
    sprite.addEventListener("error",() => resolve(null));
    sprite.src = source;
  });
}