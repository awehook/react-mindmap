import { Model, createKey } from "@blink-mind/core";

export const memorize = function(f) {
  let caches = {}
  return (...rest) => {
      const h = rest;
       if (caches.hasOwnProperty(h)) {
          return caches[h];
      } else {
          caches[h] = f(...rest)
          return caches[h]
      }
  }
}

export const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
};

export function generateSimpleModel() {
  const rootKey = createKey();

  return Model.create({
    rootTopicKey: rootKey,
    topics: [
      {
        key: rootKey,
        blocks: [{ type: "CONTENT", data: "MainTopic" }]
      }
    ]
  });
}
