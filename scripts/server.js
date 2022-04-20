import { request, prequest, quest } from "./request.js";

await prequest({ type: "feature-definitions" });

const definitions = await (await fetch("../features/definitions.json")).json();

for (const definition in definitions){
  const entries = definitions[definition];
  for (const [i,feature] of entries.entries()){
    definitions[definition][i] = await (await fetch(`../features/${definition}/${feature}`)).json();
  }
}

quest({ type: "feature-definitions", content: definitions });