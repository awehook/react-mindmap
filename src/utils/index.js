import { Model } from "@blink-mind/core";

export const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
};

export function generateSimpleModel() {
  return Model.create({
    rootTopicKey: "root",
    topics: [
      {
        key: "root",
        blocks: [{ type: "CONTENT", data: "MainTopic" }],
        subKeys: ["sub1", "sub2"]
      },
      {
        key: "sub1",
        parentKey: "root",
        blocks: [{ type: "CONTENT", data: "SubTopic1" }],
        subKeys: ["sub1_1", "sub1_2"],
        collapse: false
      },
      {
        key: "sub1_1",
        parentKey: "sub1",
        blocks: [{ type: "CONTENT", data: "SubTopic" }],
        collapse: false
      },
      {
        key: "sub1_2",
        parentKey: "sub1",
        blocks: [{ type: "CONTENT", data: "SubTopic" }],
        collapse: false
      },
      {
        key: "sub2",
        subKeys: ["sub2_1", "sub2_2"],
        parentKey: "root",
        blocks: [{ type: "CONTENT", data: "SubTopic2" }]
      },
      {
        key: "sub2_1",
        parentKey: "sub2",
        blocks: [{ type: "CONTENT", data: "SubTopic2" }],
        collapse: false
      },
      {
        key: "sub2_2",
        parentKey: "sub2",
        blocks: [{ type: "CONTENT", data: "SubTopic" }],
        collapse: false
      }
    ]
  });
}
