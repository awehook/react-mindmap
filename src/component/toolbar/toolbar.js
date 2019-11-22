import React from "react";
import cx from "classnames";
import { Popover, Menu, MenuItem, MenuDivider } from "@blueprintjs/core";
import "./Toolbar.css";
import { DiagramLayoutType } from "@blink-mind/core";
import { iconClassName, Icon } from "@blink-mind/renderer-react";

import { ToolbarItemLayout } from "./toolbar-item-layout";
import { ToolbarItemTheme } from "./toolbar-item-theme";
import { ToolbarItemExport } from "./toolbar-item-export";
import {ToolbarItemSaveAs} from "./toolbar-item-saveas";

// import debug from "debug";
// const log = debug("app");

export class Toolbar extends React.PureComponent {
  renderExportItem() {
    const { onClickExportJson } = this.props;
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
  render() {
    const {
      onClickOpenFile,
      onClickUndo,
      onClickRedo,
      canUndo,
      canRedo
    } = this.props;

    return (
      <div className="bm-toolbar">
        <div
          className={`bm-toolbar-item ${iconClassName("openfile")}`}
          onClick={onClickOpenFile}
        />
        {ToolbarItemSaveAs(this.props)}
        {ToolbarItemExport(this.props)}
        {ToolbarItemTheme(this.props)}
        {ToolbarItemLayout(this.props)}

        <div
          className={cx("bm-toolbar-item", iconClassName("undo"), {
            "bm-toolbar-item-disabled": !canUndo
          })}
          onClick={onClickUndo}
        />

        <div
          className={cx("bm-toolbar-item", iconClassName("redo"), {
            "bm-toolbar-item-disabled": !canRedo
          })}
          onClick={onClickRedo}
        />
      </div>
    );
  }
}
