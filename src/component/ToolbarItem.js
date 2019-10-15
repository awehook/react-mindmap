import React from "react";
import cx from "classnames";

export const ToolbarItem = ({diagramState, onChange,config,op})=>{
  const onClick = () => {
    if (config.opType) {
      op(config.opType, null);
    } else if (config.clickHandler) {
      config.clickHandler(diagramState, onChange);
    }
  };
  return (
    <i
      className={cx("bm-toolbar-item", "iconfont", `bm-${config.icon}`)}
      onClick={onClick}
      title={config.label}
    />
  );
};
