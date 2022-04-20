import { request, prequest, quest } from "./request.js";

const server = new Worker(new URL("./server.js",import.meta.url),{ type: "module" });

const { content: definitions } = await request(server,{ type: "feature-definitions" });

console.log(definitions);