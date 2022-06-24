import { TopicDirection  } from '@blink-mind/core';
import debug from 'debug';
import * as React from 'react';
import styled from 'styled-components';
import { linksRefKey, topicRefKey } from '@blink-mind/renderer-react';

const log = debug('node:topic-widget');

const Node = styled.div`
  display: flex;
  align-items: center;
  flex-direction: ${props =>
    props.topicDirection === TopicDirection.RIGHT ? 'row' : 'row-reverse'};
`;


const NodeChildren = styled.div`
  position: relative;
  padding: ${props =>
    props.dir === TopicDirection.RIGHT
      ? `0 0 0 ${props.marginH}px`
      : `0 ${props.marginH}px 0 0`};
`;

const NodeTopic = styled.div`
  display: flex;
  position: relative;
  align-items: center;

  flex-direction: ${props =>
    props.topicDirection === TopicDirection.RIGHT ? 'row' : 'row-reverse'};
`;

export class MyTopicWidget extends React.PureComponent {
  renderSubTopics() {
    const props = this.props;
    const { controller, model, topicKey, dir } = props;
    const topics = model.getTopic(topicKey).subKeys.toArray();
    const res = controller.run('createSubTopics', { ...props, topics });
    if (!res) return null;
    const { subTopics } = res;
    const subLinks = controller.run('renderSubLinks', props);
    return (
      <NodeChildren dir={dir} marginH={model.config.theme.marginH}>
        {subTopics} {subLinks}
      </NodeChildren>
    );
  }

  // componentDidUpdate(): void {
  //   this.layoutLinks();
  // }
  //
  // componentDidMount(): void {
  //   this.layoutLinks();
  // }

  layoutLinks() {
    const { getRef, topicKey, model } = this.props;
    const topic = model.getTopic(topicKey);
    if (topic.subKeys.size === 0 || topic.collapse) return;
    log('layoutLinks', topicKey);
    const links = getRef(linksRefKey(topicKey));
    links && links.layout();
  }

  render() {
    const props = this.props;
    const { controller, topicKey, dir, saveRef } = props;
    log('render', topicKey);
    const topicStyle = controller.run('getTopicContentStyle', props);
    const propsMore = {
      ...props,
      topicStyle
    };
    const topicContent = controller.run('renderTopicContent', propsMore);

    return (
      <Node topicDirection={dir}>
        <NodeTopic topicDirection={dir} ref={saveRef(topicRefKey(topicKey))}>
          {topicContent}
        </NodeTopic>
        {this.renderSubTopics()}
      </Node>
    );
  }
}
