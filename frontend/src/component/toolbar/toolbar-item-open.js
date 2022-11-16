import React from "react";
import { Map as ImmutableMap } from 'immutable';
import { iconClassName, browserOpenFile } from "@blink-mind/renderer-react";

export function ToolbarItemOpen(props) {
  const onClickOpenFile = e => {
    const { diagramProps, openNewModel } = props;
    const { controller } = diagramProps;
    browserOpenFile(".json,.blinkmind,.bm").then(txt => {
      let obj = JSON.parse(txt);
      let model = controller.run("deserializeModel", { controller, obj });
      openNewModel(model)
    });
  };
  return (
    <div
      className={`bm-toolbar-item ${iconClassName("openfile")}`}
      onClick={onClickOpenFile}
    />
  );
}
