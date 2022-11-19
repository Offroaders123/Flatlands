import { ctx } from "./canvas.js";

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
    Object.defineProperty(definitions[definition][key].texture,"image",{ get: () => (image) ? image : missingTextureSprite });
  }
}

definitions.terrain.ground.texture.pattern = ctx.createPattern(definitions.terrain.ground.texture.image,"repeat");

export const { entity, item, terrain } = definitions;

function loadSprite(source: string){
  return new Promise(resolve => {
    const sprite = new Image();
    sprite.addEventListener("load",() => resolve(sprite));
    sprite.addEventListener("error",() => resolve(null));
    sprite.src = source;
  });
}