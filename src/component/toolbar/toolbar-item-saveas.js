import cx from "classnames";
import {iconClassName} from "@blink-mind/renderer-react";
import {Menu, MenuDivider, MenuItem, Popover} from "@blueprintjs/core";
import React from "react";

export function ToolbarItemSaveAs(props) {
  const { onClickExportJson } = props;
  return (
    <div className={cx("bm-toolbar-item", iconClassName("saveas"))}>
      <Popover enforceFocus={false}>
        <div className="bm-toolbar-popover-target" />
        <Menu>
          <MenuItem text="JSON(.json)" onClick={onClickExportJson} />
          <MenuDivider />
        </Menu>
      </Popover>
    </div>
  );
}