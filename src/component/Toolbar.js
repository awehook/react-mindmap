import React from "react";
import { ToolbarItem } from "./ToolbarItem";
import { Popover, Menu, MenuItem, MenuDivider } from "@blueprintjs/core";
import "./Toolbar.css";
import { iconClassName } from "@blink-mind/renderer-react";
import debug from "debug";
const log = debug("app");

export class Toolbar extends React.Component {
  items = [
    {
      icon: "openfile",
      label: "open file",
      clickHandler: this.showPopupOpenFile
    },
    {
      icon: "export",
      label: "export file",
      clickHandler: this.showPopupExport
    },
    {
      icon: "theme",
      label: "change theme",
      clickHandler: this.showPopupChangeTheme
    },
    {
      icon: "undo",
      label: "undo",
      clickHandler: this.handleUndo
    },
    {
      icon: "redo",
      label: "redo",
      clickHandler: this.handleRedo
    }
  ];

  render() {
    const { onClickExportJson, onClickOpenFile } = this.props;
    return (
      <div>
        <div
          className={`bm-toolbar-item ${iconClassName("openfile")}`}
          onClick={onClickOpenFile}
        />
        <div className="bm-toolbar-item">
          <Popover enforceFocus={false}>
            <div className={iconClassName("export")} />
            <Menu>
              <MenuItem text="JSON(.json)" onClick={onClickExportJson} />
              <MenuDivider />
            </Menu>
          </Popover>
        </div>

        <div className="bm-toolbar-item">
          <Popover enforceFocus={false}>
            <div className={iconClassName("theme")} />
            <Menu>
              <MenuItem text="JSON(.json)" onClick={onClickExportJson} />
              <MenuDivider />
            </Menu>
          </Popover>
        </div>
      </div>
    );
  }
}
