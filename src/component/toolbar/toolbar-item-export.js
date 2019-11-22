import cx from "classnames";
import { iconClassName } from "@blink-mind/renderer-react";
import { Menu, MenuDivider, MenuItem, Popover } from "@blueprintjs/core";
import React from "react";
import {downloadFile} from "../../utils";

export function ToolbarItemExport(props) {
  const onClickExportJson = e => {
    const { controller } = props;

    const json = controller.run("serializeModel", props);
    const jsonStr = JSON.stringify(json);
    const url = `data:text/plain,${encodeURIComponent(jsonStr)}`;
    downloadFile(url, "example.json");
  };

  return (
    <div className={cx("bm-toolbar-item", iconClassName("export"))}>
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
