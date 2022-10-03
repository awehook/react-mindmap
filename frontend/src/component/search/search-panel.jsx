import { Map as ImmutableMap } from 'immutable';
import fuzzysort from 'fuzzysort';
import { FocusMode, OpType, BlockType } from '@blink-mind/core';
import * as React from 'react';
import { Omnibar } from '@blueprintjs/select';
import styled from 'styled-components';
import {
  Popover,
} from '@blueprintjs/core';
import EvernoteClient from '../../evernote/client.js';
import { memorize, throttled } from '../../utils/index.js';
import './search-panel.css';

const evernoteCient = new EvernoteClient(
  (process.env.NODE_ENV == 'production' ?  window.__env__?.REACT_APP_EVERNOTE_SERVER_HOST : process.env.REACT_APP_EVERNOTE_SERVER_HOST ) ?? 'localhost', 
  (process.env.NODE_ENV == 'production' ?  window.__env__?.REACT_APP_EVERNOTE_SERVER_PORT : process.env.REACT_APP_EVERNOTE_SERVER_PORT ) ?? 5000
);
const NavOmniBar = Omnibar;

const StyledNavOmniBar = styled(NavOmniBar)`
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
  .highlight {
    color: red;
  };
`;

const INPUT_PROPS = {
  placeholder: 'Search'
};

const getLasteNotes = (start, offset, sync, callback) => {
    const results = evernoteCient.getAllNoteList({start, offset, filter_order: 2}, sync, callback);
    if (!sync) return;
    let notes;
    if (results.hasOwnProperty('error')) {
      notes = []
    } else {
      notes = results.notes
    }
    return notes;
}

const getAllNotes = memorize((start, offset, sync=true, callback=null) => {
    const results = evernoteCient.getAllNoteList({ start, offset }, sync, callback);
    if (!sync) return;
    let notes;
    if (results.hasOwnProperty('error')) {
      notes = []
    } else {
      notes = results.notes
    }
    return notes;
  }
)

const mergeNotes = (oldNotes, newNotes) => {
    if (!oldNotes) return newNotes;
    let uniqueKeys = new Set();
    return [...oldNotes, ...newNotes].filter(note => {
        if (uniqueKeys.has(note.guid)) {
            return false;
        } else {
          uniqueKeys.add(note.guid)
          return true;
        }
    })
}

const offset = 500;

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
    const titleProps = {
      key: guid,
      onClick: attachNote({ guid, title: note.title }),
      dangerouslySetInnerHTML: {__html: title}
    };
    const titleEl = <TopicTitle {...titleProps}></TopicTitle>;
    const tip = (
      <Tip>
        <TipContent dangerouslySetInnerHTML={ {__html: title} }></TipContent>
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
              {threshold: -10000, key: 'title'}).map(item => {
                const {guid, title} = item['obj'];
                return {guid, title, fuzzySearchResult: item, highlighted: fuzzysort.highlight(item, '<b class="highlight">')};
              })
  };

  React.useEffect(
    () => {
        console.log((controller.currentModel.getIn(['extData', 'allnotes', 'notes'], {})).length);
    }, [controller]);

  React.useEffect(
      () => { 
        setInterval(
            () => {
                const cur = controller.currentModel.getIn(['extData', 'allnotes', 'cur'], 0);
                if (cur > 10000) return;
                getAllNotes(cur, cur + offset, false, (xhr) => {
                    console.log(xhr.responseText); // 请求成功
                    const newNotes = JSON.parse(xhr.responseText);
                    let newModel = controller.currentModel.updateIn(['extData', 'allnotes', 'notes'], notes => mergeNotes(notes, newNotes['notes']))
                    newModel = newModel.updateIn(['extData', 'allnotes', 'cur'], cur => cur === undefined ? offset : cur + offset)
                    controller.change(newModel, () => {})
                    // setNotes(notes => [...(new Set([...notes, ...newNotes['notes']]))])
                    // setCur(cur => cur + offset);
                    console.log('update notes')
                })
            }
          , 20000)
      }, []);

  // update latest 100 notes
  const onQueryChange = React.useCallback(throttled(
      () => {
          getLasteNotes(0, 100, false, (xhr) => {
              console.log(xhr.responseText); // 请求成功
              const newNotes = JSON.parse(xhr.responseText);
              let newModel = controller.currentModel.updateIn(['extData', 'allnotes', 'notes'], notes => mergeNotes(notes, newNotes['notes']))
              controller.change(newModel, () => {})
              console.log('update latest 100 notes')
          })
      }, 20000)
  , [])

  return (
    <StyledNavOmniBar
      inputProps={INPUT_PROPS}
      itemListPredicate={filterMatches}
      onQueryChange={onQueryChange}
      isOpen={true}
      items={filterAlreadyExists(controller.currentModel.getIn(['extData', 'allnotes', 'notes'], []))}
      itemRenderer={renderItem}
      // onItemSelect={handleItemSelect}
      onClose={onClose}
      resetOnSelect={true}
    />
  );
}
