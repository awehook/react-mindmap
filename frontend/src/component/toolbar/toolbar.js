import React from "react";
import cx from "classnames";
import "./Toolbar.css";
import { iconClassName } from "@blink-mind/renderer-react";
import { ToolbarItemOpen } from "./toolbar-item-open";
import { ToolbarItemLayout } from "./toolbar-item-layout";
import { ToolbarItemTheme } from "./toolbar-item-theme";
import { ToolbarItemExport } from "./toolbar-item-export";
import { ToolbarItemSearch } from "./toolbar-item-search";

// import debug from "debug";
// const log = debug("app");

export class Toolbar extends React.PureComponent {
  render() {
    const props = this.props;

    const { onClickUndo, onClickRedo, canUndo, canRedo } = props;

    return (
      <div className="bm-toolbar">
        <ToolbarItemOpen {...props} />
        <ToolbarItemExport {...props} />
        <ToolbarItemTheme {...props} />
        <ToolbarItemLayout {...props} />
        <ToolbarItemSearch {...props} />

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
