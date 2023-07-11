import { FocusMode, OpType, TopicRelationship, getAllSubTopicKeys, getKeyPath, getRelationship } from '@blink-mind/core';
import {
  Popover
} from '@blueprintjs/core';
import { Omnibar } from '@blueprintjs/select';
import cx from 'classnames';
import fuzzysort from 'fuzzysort';
import * as React from 'react';
import styled from 'styled-components';
import { iconClassName } from '../../icon';
import '../../icon/index.css';
import './search-panel.css';

const StyledNavOmniBar = styled(Omnibar)`
  top: 20%;
  left: 25% !important;
  width: 50% !important;
`;

const TopicTitle = styled.div`
  margin: 0 5px;
  padding: 10px 5px;
  width: 100%;
  font-size: 16px;
  cursor: pointer;
  .highlight {
    color: red;
  };
  &:hover {
    background: #e3e8ec;
  }
`;

const StyledPopover = styled(Popover)`
  display: block;
`;

const Tip = styled.div`
  padding: 10px;
  font-size: 16px;
  //max-width: 800px;
  //max-height: 600px;
  overflow: auto;
`;

const TipContent = styled.div`
  white-space: break-spaces;
`;

const INPUT_PROPS = {
  placeholder: 'Search'
};

export function SearchPanel(props) {
  const { model, setSearchWord, controller } = props;
  const onClose = () => {
    controller.run('operation', {
      ...props,
      opType: OpType.SET_FOCUS_MODE,
      focusMode: FocusMode.NORMAL
    });
  };

  const getAllSections = () => {
    const allowCrossLevelSearch = model.getIn(["extData", "allowCrossLevelSearch"], true);
    const avaiableTopicKeys = allowCrossLevelSearch ? Array.from(model.topics.keys())
                                                    : getAllSubTopicKeys(model ,model.editorRootTopicKey);
    const res = avaiableTopicKeys.map(
      topicKey => { 
        const parentKeys = getKeyPath(model, topicKey, false);
        const parentTitles = parentKeys.map(key => controller.run('getTopicTitle', { ...props, topicKey: key}))
        return {
          key: topicKey,
          title : controller.run('getTopicTitle', { ...props, topicKey }),
          parents: parentTitles.join(" > ")
        }
      }
    )
    return res;
  };

  const focusAndMove = (model, topicKey) => {
    controller.run(
      'focusTopicAndMoveToCenter', { 
        ...props, 
        model,
        topicKey,
      }, 
    );
  }

  const navigateToTopic = topicKey => e => {
    const { model, controller } = props;
    if (getRelationship(model, topicKey, model.editorRootTopicKey) !== TopicRelationship.DESCENDANT)
    {
      controller.run('operation', {
        ...props,
        opArray: [
          {
            opType: OpType.SET_FOCUS_MODE,
            focusMode: FocusMode.NORMAL
          },
          {
            opType: OpType.SET_EDITOR_ROOT,
            topicKey,
          },
        ],
      });
      focusAndMove(controller.currentModel, topicKey)
    }
    else
    {
      focusAndMove(model, topicKey)
    }
  };

  // const renderItem = (section, props) => {
  //   const { key, title: sectionTitle } = section;
  //   const maxLength = 100;
  //   const needTip = sectionTitle.length > maxLength;
  //   const title = needTip
  //     ? sectionTitle.substr(0, maxLength) + '...'
  //     : sectionTitle;
  //   const titleProps = {
  //     key,
  //     onClick: navigateToTopic(key)
  //   };
  //   const titleEl = <TopicTitle {...titleProps}>{title}</TopicTitle>;
  //   const tip = (
  //     <Tip>
  //       <TipContent>{sectionTitle}</TipContent>
  //     </Tip>
  //   );
  //   const popoverProps = {
  //     key,
  //     target: titleEl,
  //     content: tip,
  //     fill: true,
  //     interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY,
  //     hoverOpenDelay: 1000
  //   };
  //   return needTip ? <StyledPopover {...popoverProps} /> : titleEl;
  // };

  // const filterMatches = (
  //   query,
  //   items
  // ) => {
  //   return items.filter(item =>
  //     item.title.toLowerCase().includes(query.toLowerCase())
  //   );
  // };

  const renderItem = (item, itemProps) => {
    const { key: topicKey, highlighted: noteTitle, parents } = item;
    const { modifiers } = itemProps;
    const maxLength = 10000;
    const needTip = noteTitle.length > maxLength;
    const title =  needTip
      ? noteTitle.substr(0, maxLength) + '...'
      : noteTitle;
    const isEvernoteAttached = model.getIn(["extData", "evernote", topicKey]);
    const isJupyterNotebookAttached = model.getIn(["extData", "jupyter", topicKey]);
    const children = <div className={ "clearfix" }> 
            <span className={ "left" } dangerouslySetInnerHTML={{__html: title}} /> 
            <span className={ "right noteAttr" } > { parents } </span> 
            { isEvernoteAttached && <span className={ cx("right", "noteAttr", iconClassName("evernote")) }></span> }
            { isJupyterNotebookAttached && <span className={ cx("right", "noteAttr", iconClassName("jupyter")) }></span> }
            {/* <span className={ "right noteAttr" } > { notebooks.get(note.notebookGuid) ?? 'Unknown' } </span>  */}
        </div>
    const titleProps = {
      key: topicKey,
      // dangerouslySetInnerHTML: {__html: title + "  " + note.notebookGuid },
      children: children,
      onClick: (e) => navigateToTopic(item.key)(e),
      style: {
        background: modifiers.active ? "#e3e8ec" : "#fff" 
      }
    };
    const titleEl = <TopicTitle {...titleProps}></TopicTitle>;
    const tip = (
      <Tip>
        <TipContent dangerouslySetInnerHTML={ {__html: noteTitle } }></TipContent>
      </Tip>
    );
    const popoverProps = {
      key: topicKey,
      target: titleEl,
      content: tip,
      fill: true,
      interactionKind: 'HOVER_TARGET_ONLY',
      hoverOpenDelay: 1000,
    };
   return needTip ? <StyledPopover {...popoverProps} /> : titleEl;
  };

  const filterMatches = (
    query,
    items
  ) => {
     return fuzzysort.go(query.toLowerCase(), 
              items,
              {threshold: -10000, key: 'title'}).map(res => {
                return {
                  ...res['obj'],
                  fuzzySearchResult: res, 
                  highlighted: fuzzysort.highlight(res, '<b class="highlight">')};
              })
  };

  const sections = getAllSections();

  return (
    <StyledNavOmniBar
      inputProps={INPUT_PROPS}
      itemListPredicate={filterMatches}
      isOpen={true}
      items={sections}
      itemRenderer={renderItem}
      onClose={onClose}
      onItemSelect={(item, e) => navigateToTopic(item.key)(e)}
    />
  );
}