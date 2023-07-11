import { Model, createKey } from "@blink-mind/core";
import { getRelationship, TopicRelationship } from '@blink-mind/core'

export const memorize = function (f) {
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

export function getNotesFromModel(model, defaultValue = []) {
  return model?.getIn(['extData', 'allnotes', 'notes'], defaultValue)
}

export function nonEmpty(obj) {
  return (obj !== null) && (obj !== undefined);
}

export function empty(obj) {
  return !nonEmpty(obj)
}

export function getEnv(key, defaultValue = null) {
  return (process.env.NODE_ENV === 'production' ? window.__env__[key]
    : process.env[key]) ?? defaultValue;
}

export function isTopicVisible(model, topicKey) {
  return topicKey === model.editorRootTopicKey 
          || getRelationship(model, topicKey, model.editorRootTopicKey) === TopicRelationship.DESCENDANT;
}

export const getCumSum = (s) => {
  if (!Array.isArray(s))
    throw new Error('s must be an array');
  const cumSum = new Array(s.length + 1).fill(0);
  s.forEach((v, i) => {
    cumSum[i+1] = cumSum[i] + s[i]
  })
  return cumSum;
}