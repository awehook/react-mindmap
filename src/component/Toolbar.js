import React from "react";
import { ToolbarItem, ToolbarItemConfig } from "./ToolbarItem";
import "./Toolbar.css";
import { OpType, DiagramState } from "blink-mind-react";

import { PopupExportContent, PopupOpenFileContent } from "./PopupContent";

import Popup from "react-popup";

export class Toolbar extends React.Component {
  constructor(props) {
    super(props);
  }

  showPopupExport = diagramState => {
    console.log("showPopupExport");
    Popup.registerPlugin("popupExport", function() {
      this.create({
        title: "Please select export file format",
        content: <PopupExportContent diagramState={diagramState} />
      });
    });
    Popup.plugins().popupExport();
  };

  showPopupOpenFile = (diagramState, onChange) => {
    Popup.registerPlugin("popupOpenFile", function() {
      this.create({
        title: "Open File",
        content: (
          <PopupOpenFileContent
            diagramState={diagramState}
            onChange={onChange}
          />
        )
      });
    });
    Popup.plugins().popupOpenFile();
  };

  items = [
    {
      icon: "newfile",
      label: "new file"
      // opType: OpType.REDO
    },
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

  op = (opType, nodeKey, arg) => {
    let { diagramState, onChange } = this.props;
    let newState = DiagramState.op(diagramState, opType, nodeKey, arg);
    onChange(newState);
  };

  render() {
    let { diagramState, onChange } = this.props;
    let toolbarItems = this.items.map(item => (
      <ToolbarItem
        config={item}
        key={item.label}
        diagramState={diagramState}
        onChange={onChange}
        op={this.op}
      />
    ));
    return (
      <div>
        <div className="bm-toolbar">{toolbarItems}</div>
        {/*{*/}
        {/*this.state.popupType==='Export' ? <PopupExport/> : null*/}
        {/*}*/}
      </div>
    );
  }
}
