import React from "react";
import { iconClassName } from "@blink-mind/renderer-react";

export function ToolbarItemOpen(props) {
  const onClickOpenFile = e => {
    const { diagram } = props;
    const diagramProps = diagram.getDiagramProps();
    const { controller } = diagramProps;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.bm,.blinkmind";
    input.addEventListener("change", evt => {
      const file = evt.target.files[0];
      const fr = new FileReader();
      fr.onload = evt => {
        const txt = evt.target.result;
        let obj = JSON.parse(txt);
        let model = controller.run("deserializeModel", { controller, obj });
        controller.change(model);
      };
      fr.readAsText(file);
    });
    input.click();
  };
  return (
    <div
      className={`bm-toolbar-item ${iconClassName("openfile")}`}
      onClick={onClickOpenFile}
    />
  );
}
