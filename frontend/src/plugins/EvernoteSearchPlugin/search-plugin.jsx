// @ts-check
import { OpType } from '@blink-mind/core';
import debug from 'debug';
import * as React from 'react';
import { OFFSET } from '../../constants';
import { getAllNotes, getNotebookList, mergeNotes } from "../../evernote/noteHelper";
import { retrieveResultFromNextNode } from '../../utils/retrieveResultFromNextNode';
import { SearchPanel } from './search-panel';
import { FOCUS_MODE_SEARCH_NOTE_TO_ATTACH, HOT_KEY_NAME_SEARCH } from './utils';

const log = debug("plugin:EvernoteSearchPlugin");

const updateNotes = (props) => {
  setInterval(
    () => {
      const { controller, model } = props;
      log(`regularly updating notes`)
      let cur = controller.currentModel.getIn(['extData', 'allnotes', 'cur'], 0);
      if (cur > 10000) { cur = 0; }
      getAllNotes(cur, cur + OFFSET, false, (xhr) => {
        log(xhr.responseText); // 请求成功
        const newNotes = JSON.parse(xhr.responseText)?.notes ?? [];
        let newModel = controller.currentModel.updateIn(['extData', 'allnotes', 'notes'], notes => mergeNotes(notes ?? [], newNotes))
        newModel = newModel.updateIn(['extData', 'allnotes', 'cur'], () => cur + OFFSET)
        controller.change(newModel, () => {
          log(`regularly updated ${OFFSET} notes`)
        })
      }, (xhr) => {
        log(`regularly updated 0 note because query failed`)
      })
    }
    , 6000)
}

// update notebooks regularly
const updateNotebooks = (props) => {
  setInterval(
    () => {
      const { controller } = props;
      log(`regularly updating notebooks`)
      getNotebookList(false, (xhr) => {
        log(xhr.responseText); // 请求成功
        const data = JSON.parse(xhr.responseText);
        const newModel = controller.currentModel.updateIn(['extData', 'allnotes', 'notebooks'], notebooks => new Map(data.notebooks.map(item => [item.guid, item.name])))
        controller.change(newModel, () => { })
        log(`regularly updated ${data.notebooks.length} notebooks`)
      }, (xhr) => {
        log(`regularly updated 0 notebooks because query failed`)
      })
    }
    , 60000)
}


export function EvernoteSearchPlugin() {
  let searchWord;
  const setSearchWorld = s => {
    searchWord = s;
  };
  return {
    customizeHotKeys(props, next) {
      const { controller, model } = props;
      const hotKeys = next();

      hotKeys.topicHotKeys.set(HOT_KEY_NAME_SEARCH, {
        label: 'search',
        combo: 'mod + f',
        onKeyDown: () => {
          controller.run('operation', {
            ...props,
            opType: OpType.FOCUS_TOPIC,
            topicKey: model.focusKey,
            focusMode: FOCUS_MODE_SEARCH_NOTE_TO_ATTACH
          });
        }
      });
      return hotKeys;
    },

    renderDiagramCustomize(props, next) {
      const res = next();
      const { model } = props;
      if (model.focusMode === FOCUS_MODE_SEARCH_NOTE_TO_ATTACH) {
        const searchPanelProps = {
          key: 'search-panel-evernote',
          ...props,
          setSearchWorld
        };
        res.push(<SearchPanel {...searchPanelProps} />);
      }
      return res;
    },
    startRegularJob(props, next) {
      const res = retrieveResultFromNextNode(next)
      res.push({
        funcName: "updateNotes",
        func: () => updateNotes(props)
      })
      res.push({
        funcName: "updateNotebooks",
        func: () => updateNotebooks(props)
      })
      return res;
    }
  };
}
