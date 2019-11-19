import React from "react";
import cx from "classnames";
import { Popover, Menu, MenuItem, MenuDivider } from "@blueprintjs/core";
import "./Toolbar.css";
import { iconClassName } from "@blink-mind/renderer-react";
import defaultThemeImg from "../images/default.jpg";
import theme1Img from "../images/theme1.jpg";
import theme2Img from "../images/theme2.jpg";
import theme3Img from "../images/theme3.jpg";
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
    const {
      onClickExportJson,
      onClickOpenFile,
      onClickChangeTheme,
      onClickUndo,
      onClickRedo,
      canUndo,
      canRedo
    } = this.props;
    const themes = [
      ["default", defaultThemeImg],
      ["theme1", theme1Img],
      ["theme2", theme2Img],
      ["theme3", theme3Img]
    ];
    return (
      <div className="bm-toolbar">
        <div
          className={`bm-toolbar-item ${iconClassName("openfile")}`}
          onClick={onClickOpenFile}
        />
        <div className={cx("bm-toolbar-item",iconClassName("export"))}>
          <Popover enforceFocus={false}>
            <div className='bm-toolbar-popover-target'/>
            <Menu>
              <MenuItem text="JSON(.json)" onClick={onClickExportJson} />
              <MenuDivider />
            </Menu>
          </Popover>
        </div>

        <div className={cx("bm-toolbar-item",iconClassName("theme"))}>
          <Popover enforceFocus={false}>
            <div className='bm-toolbar-popover-target'/>
            <div>
              {themes.map(theme => (
                <div
                  className="bm-theme-item"
                  onClick={onClickChangeTheme(theme[0])}
                >
                  <img className="bm-theme-img" src={theme[1]} />
                </div>
              ))}
            </div>
          </Popover>
        </div>

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
