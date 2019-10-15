import React from "react";
import { ToolbarItem } from "./ToolbarItem";
import "./Toolbar.css";
import { OpType } from "blink-mind-react";

import {
  PopupChangeTheme,
  PopupExportContent,
  PopupOpenFileContent
} from "./PopupContent";

import Popup from "react-popup";

export class Toolbar extends React.Component {
  showPopupExport = diagramState => {
    Popup.create({
      title: "Please select export file format",
      content: <PopupExportContent diagramState={diagramState} />
    });
  };

  showPopupOpenFile = (diagramState, onChange) => {
    Popup.create({
      title: "Open File",
      content: (
        <PopupOpenFileContent diagramState={diagramState} onChange={onChange} />
      )
    });
  };

  showPopupChangeTheme = (diagramState, onChange) => {
    Popup.create({
      title: "Change Theme",
      content: (
        <PopupChangeTheme diagramState={diagramState} onChange={onChange} />
      )
    });
  };

  items = [
    // {
    //   icon: "newfile",
    //   label: "new file"
    //   // opType: OpType.REDO
    // },
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
      opType: OpType.UNDO
    },
    {
      icon: "redo",
      label: "redo",
      opType: OpType.REDO
    },
    {
      icon: "add-sibling",
      label: "add sibling",
      opType: OpType.ADD_SIBLING
    },
    {
      icon: "add-child",
      label: "add child",
      opType: OpType.ADD_CHILD
    },
    {
      icon: "delete-node",
      label: "delete node",
      opType: OpType.DELETE_NODE
    }
  ];

  render() {
    let { diagramState, onChange, op } = this.props;
    let toolbarItems = this.items.map(item => (
      <ToolbarItem
        config={item}
        key={item.label}
        diagramState={diagramState}
        onChange={onChange}
        op={op}
      />
    ));
    return (
      <div>
        <div className="bm-toolbar">{toolbarItems}</div>
      </div>
    );
  }
}
