import React from "react";

import { Toolbar } from "./Toolbar";

import { Model } from '@blink-mind/core';
import { Diagram } from '@blink-mind/renderer-react';
import richTextEditorPlugin from '@blink-mind/plugin-rich-text-editor';
import '@blink-mind/renderer-react/lib/main.css'

const plugins = [richTextEditorPlugin()];
function generateSimpleModel() {
  return Model.create({
    rootTopicKey: 'root',
    topics: [
      { key: 'root', content: 'MainTopic', subKeys: ['sub1', 'sub2'] },
      {
        key: 'sub1',
        parentKey: 'root',
        content: 'SubTopic1',
        subKeys: ['sub1_1', 'sub1_2'],
        collapse: false
      },
      {
        key: 'sub1_1',
        parentKey: 'sub1',
        content: 'SubTopic',
        collapse: false
      },
      {
        key: 'sub1_2',
        parentKey: 'sub1',
        content: 'SubTopic',
        collapse: false
      },
      {
        key: 'sub2',
        subKeys: ['sub2_1', 'sub2_2'],
        parentKey: 'root',
        content: 'SubTopic2'
      },
      {
        key: 'sub2_1',
        parentKey: 'sub2',
        content: 'SubTopic',
        collapse: false
      },
      {
        key: 'sub2_2',
        parentKey: 'sub2',
        content: 'SubTopic',
        collapse: false
      }
    ]
  });
}

export class MindMap extends React.Component {
  constructor(props) {
    super(props);
    this.initModel()
  }

  initModel() {
    const model = generateSimpleModel();
    this.state = {
      model
    };
  }

  renderDiagram() {
    return (
      <Diagram
        model={this.state.model}
        onChange={this.onChange}
        plugins={plugins}
      />
    );
  }


  onChange = (model) => {
    this.setState({
      model
    });
  };





  render() {
    return (
      <div className="mindmap">
        {this.renderDiagram()}
      </div>
    );
  }
}

export default MindMap;
