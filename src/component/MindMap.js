import React from "react";
import Keys from "fbjs/lib/Keys";
import {
  DiagramWidget,
  MindMapModel,
  DiagramState,
  OpType,
  FocusItemMode
} from "blink-mind-react";

import { Toolbar } from "./Toolbar";

export class MindMap extends React.Component {
  constructor(props) {
    super(props);
    let mindModel = MindMapModel.createWith({
      rootItemKey: "root",
      editorRootItemKey: "root",
      items: [
        { key: "root", content: "MainTopic", subItemKeys: ["sub1", "sub2"] },
        {
          key: "sub1",
          parentKey: "root",
          content: "SubTopic",
          subItemKeys: [],
          collapse: true
        },
        {
          key: "sub2",
          parentKey: "root",
          content: "SubTopic",
          subItemKeys: []
        }
      ]
    });
    let diagramConfig = {
      hMargin: 10
    };
    let diagramState = DiagramState.createWith(mindModel, diagramConfig);
    this.state = {
      diagramState: diagramState
    };
  }

  getFocusItemMode() {
    return this.state.diagramState.mindMapModel.getFocusItemMode();
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
  }

  onChange = diagramState => {
    // console.log("onChange");
    // console.log(diagramState.mindMapModel);
    this.setState({ diagramState });
  };

  onKeyDown = e => {
    let focusItemMode = this.getFocusItemMode();
    if (
      focusItemMode === FocusItemMode.Normal ||
      focusItemMode === FocusItemMode.PopupMenu
    ) {
      e.preventDefault();
    }
  };

  onKeyUp = e => {
    console.log(e);
    let focusItemMode = this.getFocusItemMode();
    switch (e.which) {
      case Keys.TAB:
        if (
          focusItemMode === FocusItemMode.Normal ||
          focusItemMode === FocusItemMode.PopupMenu
        ) {
          this.op(OpType.ADD_CHILD);
        }
        break;
      case Keys.RETURN:
        if (
          focusItemMode === FocusItemMode.Normal ||
          focusItemMode === FocusItemMode.PopupMenu
        ) {
          this.op(OpType.ADD_SIBLING);
        }
        if (focusItemMode === FocusItemMode.Editing) {
          if (e.ctrlKey) {
            this.op(OpType.ADD_SIBLING);
          }
        }
        break;
      default:
        break;
    }
  };

  op = (opType, nodeKey, arg) => {
    let { diagramState } = this.state;
    let newState = DiagramState.op(diagramState, opType, nodeKey, arg);
    this.onChange(newState);
  };

  render() {
    return (
      <div className="mindmap">
        <Toolbar
          diagramState={this.state.diagramState}
          onChange={this.onChange}
          op={this.op}
        />
        <DiagramWidget
          diagramState={this.state.diagramState}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default MindMap;
