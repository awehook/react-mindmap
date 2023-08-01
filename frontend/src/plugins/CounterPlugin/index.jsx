import React from "react";
import { debug } from "debug";
import { Button } from "@blueprintjs/core";
import { retrieveResultFromNextNode } from "../../utils/retrieveResultFromNextNode";

const log = debug("plugin:CounterPlugin")

const CounterButton = (props) => {
  const { controller, model } = props;
  const nTopics = controller.run('getAllTopicCount', { model })
  const buttonProps = {
    style: { height: "40px" },
    disable: "true"
  }
  return <div>
    <Button {...buttonProps}> {nTopics} nodes</Button>
  </div>;
}

export function CounterPlugin() {
  return {
    getAllTopicCount: (props) => {
      const { model } = props;
      log('getAllTopicCount:', { model })
      return model.topics.size;
    },
    renderLeftBottomCorner: (props, next) => {
      const res = retrieveResultFromNextNode(next);
      res.push(<CounterButton {...props} />)
      return res;
    }
  }
}