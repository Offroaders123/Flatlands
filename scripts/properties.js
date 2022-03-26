import { ctx } from "./canvas.js";

const missingTextureSprite = new Image();
missingTextureSprite.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF+QD/AAAASf/37wAAAAxJREFUeJxjcGBoAAABRADBOnocVgAAAABJRU5ErkJggg==";
let entities, items, terrain, grassPattern;

(async () => {

let entitiesFile = await fetch("feature_definitions/entities.json");
entities = await entitiesFile.json();
let itemsFile = await fetch("feature_definitions/items.json");
items = await itemsFile.json();
let terrainFile = await fetch("feature_definitions/terrain.json");
terrain = await terrainFile.json();

for (let entity in entities) await loadSprite(entity,entities);
for (let item in items) await loadSprite(item,items);
for (let terraine in terrain) await loadSprite(terraine,terrain);
grassPattern = ctx.createPattern(terrain["ground"].texture.image,"repeat");

async function loadSprite(key,object){
  return new Promise((resolve) => {
    let sprite = new Image(), { source } = object[key].texture;
    sprite.addEventListener("load",event => {//console.log(`${new URL(sprite.src).pathname.split("/").pop()} %cload?`,"color: green; font-size: 125%; font-weight: bold;");
      object[key].texture.image = sprite;
      setSlotTexturesWithItem(key,source);/* Another goal would be to add functionality to use the cached image itself (the line above, or `sprite`), rather than re-fetching it again in the CSS after being added as a style in `setSlotTexture()`. *edit: Super cool idea! Add canvases for each of the item renderers, rather than just an inline element, so then it can also eventually allow for item animations :O */
      resolve();
    });
    sprite.addEventListener("error",event => {//console.log(`${new URL(sprite.src).pathname.split("/").pop()} %cERROR!`,"color: red; font-size: 125%; font-weight: bold;");
      setSlotTexturesWithItem(key,missingTextureSprite.src);
      resolve();
    });
    sprite.src = source;
    function setSlotTexturesWithItem(key,source){/* It could make sense to make this a method of either the hotbar element, or the hud container once an in-game inventory is implemented. Then you could update all item slots for an item to have a certain texture */
      hotbar.slots.filter(slot => slot.value === key).forEach(slot => slot.sprite = object[key].texture);
    }
  });
}

})();

export { missingTextureSprite, entities, items, terrain, grassPattern };