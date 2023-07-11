import { MenuItem } from "@blueprintjs/core";
import React from 'react';
import { MyTopicWidget } from "../../component/MyTopicWidget";
import { KeyboardHotKeyWidget } from '../../component/keyboardHotKeyWidget';
import { Icon } from "../../icon";
import '../../icon/index.css';
import { NEW_OPERATION_OPTIONS } from '../AddNewOperationsPlugin';
import { FOCUS_MODE_SEARCH_NOTE_TO_ATTACH } from "../EvernoteSearchPlugin";
import { getEvernoteIcon, hasEvernoteAttached } from "./utils";

let HotKeyName = {
  ASSOCIATE_NOTE: 'ASSOCIATE_NOTE',
};

function op(opType, props) {
  const { topicKey, controller } = props;
  if (topicKey === undefined) {
    props = { ...props, topicKey: controller.currentModel.focusKey };
  }
  controller.run('operation', { ...props, opType });
}

export const OpType = {
  ASSOCIATE_A_NOTE: 'ASSOCIATE_A_NOTE',
  OPEN_EVERNOTE_LINK: 'OPEN_EVERNOTE_LINK',
}

const items = [
  {
    icon: 'edit',
    label: 'Associate a note',
    // shortcut: ['Space'],
    rootCanUse: false,
    opType: 'ASSOCIATE_A_NOTE',
    opOperation: NEW_OPERATION_OPTIONS.ASSOCIATE_A_NOTE
  },
  {
    icon: 'edit',
    label: 'Open evernote link',
    // shortcut: ['Space'],
    rootCanUse: false,
    opType: 'OPEN_EVERNOTE_LINK',
    opOperation: NEW_OPERATION_OPTIONS.OPEN_EVERNOTE_LINK
  }
]

export function EvernotePlugin() {
  return {
    customizeHotKeys: function (ctx, next) {
      const { controller } = ctx;
      const handleHotKeyDown = (opType, opArg) => e => {
        // log('HotKeyPlugin', opType);
        op(opType, { ...ctx, ...opArg });
        e.stopImmediatePropagation();
        e.preventDefault();
      };
      const res = next();
      const { topicHotKeys, globalHotKeys } = res;
      const newTopicHotKeys = new Map([
        [
          HotKeyName.ASSOCIATE_NOTE,
          {
            label: 'associate notes',
            combo: 'mod + up',
            allowInInput: true,
            onKeyDown: () => { alert("haha") }
          }
        ]
      ])
      return {
        topicHotKeys: new Map([...topicHotKeys, ...newTopicHotKeys]),
        globalHotKeys,
      };
      // const {topicHotKeys, globalHotKeys, viewModeTopicHotKeys }  = res;
      // const newViewModeTopicHotKeys = new Map([
      //     HotKeyName.ASSOCIATE_NOTE, 
      //     {
      //         label: 'associate notes',
      //         combo: 'mod + up',
      //         allowInInput: true,
      //         preventDefault: true,
      //         stopPropagation: true,
      //     }
      // ])
      // viewModeTopicHotKeys.set(
      //     ViewModeMindMap,
      //     new Map([...viewModeTopicHotKeys[ViewModeMindMap], ...newViewModeTopicHotKeys])
      // )
      // return {
      //       topicHotKeys,
      //       globalHotKeys,
      //       viewModeTopicHotKeys
      //     };
    },
    customizeTopicContextMenu: function (ctx, next) {
      const { topicKey, model, controller, topic } = ctx;
      const viewMode = model.config.viewMode;
      const isRoot = topicKey === model.editorRootTopicKey;

      function onClickItem(item) {
        return function (e) {
          item.opType &&
            controller.run('operation', {
              ...ctx,
              opType: item.opType,
              ...item.opArg
            });
        };
      }
      const res = items.map(item => {
        if (item.enabledFunc && !item.enabledFunc({ topic, model }))
          return null;
        if (isRoot && !item.rootCanUse) return null;
        if (item.viewMode && !item.viewMode.includes(viewMode)) return null;
        return (
          <MenuItem
            icon={Icon("evernote")}
            key={item.label}
            text={item.label}
            labelElement={<KeyboardHotKeyWidget hotkeys={item.shortcut} />}
            onClick={onClickItem(item)}
          // onClick={ click }
          />
        );
      })
      return <>
        {next()}
        {res}
      </>;
    },
    renderTopicWidget(props, next) {
      return <MyTopicWidget {...props} />
    },
    getAllowUndo: (props, next) => {
      const { model } = props;
      const res = next();
      console.log({ allow: res && model.focusMode !== FOCUS_MODE_SEARCH_NOTE_TO_ATTACH, props })
      return res && model.focusMode !== FOCUS_MODE_SEARCH_NOTE_TO_ATTACH;
    },
    renderTopicContentOthers: function (props, next) {
      const res = next();
      return <>
        {res}
        {hasEvernoteAttached(props) && getEvernoteIcon(props)}
      </>
    }
  }
}