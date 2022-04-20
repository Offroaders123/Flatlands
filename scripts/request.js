export function request(worker,data){
  if (data === undefined) [worker,data] = [globalThis,worker];
  //console.log("Started new request:",data.type);
  return new Promise((resolve) => {
    worker.addEventListener("message",event => {
      //console.log("Received request:",data.type);
      resolve(event.data);
    },{ once: true });
    worker.postMessage(data);
  });
}

export function prequest(worker,data){
  if (data === undefined) [worker,data] = [globalThis,worker];
  //console.log("Started waiting for new request:",data.type);
  return new Promise((resolve) => {
    worker.addEventListener("message",event => {
      if (data.type === event.data.type) resolve();
    },{ once: true });
  });
}

export function quest(worker,data){
  if (data === undefined) [worker,data] = [globalThis,worker];
  //console.log("Sending request reponse:",data.type);
  worker.postMessage(data);
}