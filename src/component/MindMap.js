import React from "react";
import {
  DiagramWidget,
  MindDiagramModel,
  MindMapModel,
  DiagramConfig,
  DiagramState
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

  onChange = diagramState => {
    console.log('onChange');
    console.log(diagramState.mindMapModel);
    this.setState({ diagramState });
  };

  render() {
    return (
      <div className="mindmap">
        <Toolbar
          diagramState={this.state.diagramState}
          onChange={this.onChange}
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
