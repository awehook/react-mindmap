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

export function throttled(fn, delay = 5000) {
  let oldtime = null;
  let newtime = null;
  return function (...args) {
      newtime = Date.now();
      if (oldtime === null || newtime - oldtime >= delay) {
          fn.apply(null, args)
          oldtime = Date.now();
          newtime = null;
      }
  }
}

export function getNotesFromModel(model, defaultValue=[]) {
  return model?.getIn(['extData', 'allnotes', 'notes'], defaultValue)
}

export function nonEmpty(obj) {
  return (obj !== null) && (obj !== undefined);
}