import { Map as ImmutableMap } from 'immutable';
import fuzzysort from 'fuzzysort';
import { FocusMode, OpType, BlockType } from '@blink-mind/core';
import * as React from 'react';
import { Omnibar } from '@blueprintjs/select';
import { format } from 'date-fns'
import { nonEmpty } from '../../utils/index.js';
import styled from 'styled-components';
import {
  Popover,
} from '@blueprintjs/core';
import { getDeleteNotes, getLasteNotes, mergeNotes, removeDeletedNotes } from '../../evernote/noteHelper';
import { getNotesFromModel, throttled } from '../../utils/index.js';
import './search-panel.css';

const NavOmniBar = Omnibar;

const StyledNavOmniBar = styled(NavOmniBar)`
  top: 20%;
  left: 25% !important;
  width: 50% !important;
`;

const TopicTitle = styled.div`
  // margin: 0 5px;
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
  .highlight {
    color: red;
  };
`;

const INPUT_PROPS = {
  placeholder: 'Search'
};

export function SearchPanel(props) {
  // const [cur, setCur] = React.useState(offset);
  // const [notes, setNotes] = React.useState(getAllNotes(0, offset));
  const { setSearchWord, controller } = props;
  const onClose = () => {
    controller.run('operation', {
      ...props,
      opType: OpType.SET_FOCUS_MODE,
      focusMode: FocusMode.NORMAL
    });
  };


    // model.topics.forEach((topic, topicKey) => {
    //   res.push({
    //     key: topicKey,
    //     title: controller.run('getTopicTitle', {
    //       ...props,
    //       topicKey
    //     })
    //   });
    // });
    // return res;

  const filterAlreadyExists = (notes) => {
      const evernoteData = controller.currentModel.getIn(['extData', 'evernote'], new ImmutableMap())
      const currentNotes = new Set([...evernoteData.values()].map(v => v.guid))
      return notes.filter(note => !currentNotes.has(note.guid) )
  }

  const attachNote = ({ guid, title }) => () => {
    const topicKey = controller.currentModel.focusKey;

    controller.run('operation', {
      ...props,
      model: controller.currentModel,
      topicKey: topicKey,
      opType: OpType.SET_TOPIC_BLOCK,
      blockType: BlockType.CONTENT,
      data: title,
      focusMode: FocusMode.NORMAL
    });

    controller.run('operation', {
        ...props,
        topicKey,
        model: controller.currentModel,
        opType: 'ADD_NOTE_RELATION',
        note: {topicKey, guid, title},
        focusMode: FocusMode.NORMAL
    })
  }

  const renderItem = (note, props) => {
   const { guid, highlighted: noteTitle } = note;
    const maxLength = 100;
    const needTip = note.title.length > maxLength;
    const title =  needTip
      ? noteTitle.substr(0, maxLength) + '...'
      : noteTitle;
    const notebooks = controller.currentModel.getIn(["extData", "allnotes", "notebooks"], new Map())
    const updatedTime = nonEmpty(note?.updated) ? format(new Date(note.updated), 'yyyy-MM-dd HH:mm:SS') : "UnknownTime"
    const children = <div className={ "clearfix" }> 
            <span className={ "left" } dangerouslySetInnerHTML={{__html: title}} /> 
            <span className={ "right noteAttr" } > { updatedTime } </span> 
            <span className={ "right noteAttr" } > { notebooks.get(note.notebookGuid) ?? 'Unknown' } </span> 
        </div>
    const titleProps = {
      key: guid,
      onClick: attachNote({ guid, title: note.title }),
      // dangerouslySetInnerHTML: {__html: title + "  " + note.notebookGuid },
      children: children
    };
    const titleEl = <TopicTitle {...titleProps}></TopicTitle>;
    const tip = (
      <Tip>
        <TipContent dangerouslySetInnerHTML={ {__html: noteTitle } }></TipContent>
      </Tip>
    );
    const popoverProps = {
      key: guid,
      target: titleEl,
      content: tip,
      fill: true,
      interactionKind: 'HOVER_TARGET_ONLY',
      hoverOpenDelay: 1000
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

  // update latest 100 notes
  const onQueryChange = React.useCallback(throttled(
      () => {
          getDeleteNotes(false, (xhr) => {
              console.log('deleted', xhr.responseText); // 请求成功
              const deletedNotes = JSON.parse(xhr.responseText)?.['notes'] ?? [];
              getLasteNotes(0, 100, false, false, (xhr) => {
                  console.log('latest', xhr.responseText); // 请求成功
                  const newNotes = JSON.parse(xhr.responseText)?.['notes'] ?? [];
                  let newModel = controller.currentModel.updateIn(['extData', 'allnotes', 'notes'], notes => removeDeletedNotes(deletedNotes, mergeNotes(notes ?? [], newNotes)))
                  controller.change(newModel, () => {})
                  console.log('update latest 100 notes')
              });
          })
      }, 20000)
  , [])

  const items = filterAlreadyExists(getNotesFromModel(controller.currentModel, []))
  console.log("[StyledNavOmniBar]:", {items})
  return (
    <StyledNavOmniBar
      inputProps={INPUT_PROPS}
      itemListPredicate={filterMatches}
      onQueryChange={onQueryChange}
      isOpen={true}
      items={ items }
      itemRenderer={renderItem}
      onClose={onClose}
      resetOnSelect={true}
    />
  );
}
