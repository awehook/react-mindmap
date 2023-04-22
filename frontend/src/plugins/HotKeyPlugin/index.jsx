import { MenuItem } from "@blueprintjs/core";
import { Map as ImmutableMap } from "immutable";
import React from 'react';
import { MyTopicWidget } from "../../component/MyTopicWidget";
import { NEW_OPERATION_OPTIONS } from '../AddNewOperationsPlugin';
import { KeyboardHotKeyWidget } from '../../component/keyboardHotKeyWidget';
import { FOCUS_MODE_SEARCH_NOTE_TO_ATTACH } from "../EvernoteSearchPlugin";
import { Icon } from "../../icon";
import '../../icon/index.css';

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

export function HotKeyPlugin() {
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
            const {topicHotKeys, globalHotKeys}  = res;
            const newTopicHotKeys = new Map([
              [
                HotKeyName.ASSOCIATE_NOTE, 
                {
                    label: 'associate notes',
                    combo: 'mod + up',
                    allowInInput: true,
                    onKeyDown: () => { alert("haha")}
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
        customizeTopicContextMenu: function(ctx, next) {
            const { topicKey, model, controller, topic } = ctx;
            const viewMode = model.config.viewMode;
            const isRoot = topicKey === model.editorRootTopicKey;

            function onClickItem(item) {
              return function(e) {
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
                  icon={ Icon("evernote") }
                  key={item.label}
                  text={item.label}
                  labelElement={<KeyboardHotKeyWidget hotkeys={item.shortcut} />}
                  onClick={onClickItem(item)}
                  // onClick={ click }
                />
              );
          })
          return <>
              { next() }
              { res }
          </>;
      },
      renderTopicWidget(props, next) {
          return <MyTopicWidget {...props} />
      },
      getAllowUndo: (props, next) => {
          const { model } = props;
          const res = next();
          console.log({allow: res && model.focusMode !== FOCUS_MODE_SEARCH_NOTE_TO_ATTACH, props})
          return res && model.focusMode !== FOCUS_MODE_SEARCH_NOTE_TO_ATTACH;
      },
      renderTopicContentOthers: function(ctx, next) {
          const { topicKey, model }  = ctx;
          const evernoteData = model.getIn(['extData', 'evernote'], new ImmutableMap());
          const res = next();
          return <>
              { res }
              { evernoteData.get(topicKey) && <img key="image1" 
                  src="data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2220px%22%20height%3D%2220px%22%20viewBox%3D%220%200%2020%2020%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cg%20id%3D%22Mac_Note_Normal_1%22%20stroke%3D%22none%22%20stroke-width%3D%221%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0A%20%20%20%20%20%20%20%20%3Cg%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpolygon%20id%3D%22footprint%22%20fill-opacity%3D%220%22%20fill%3D%22%23FFCF57%22%20points%3D%220%200%2020%200%2020%2020%200%2020%22%3E%3C%2Fpolygon%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20id%3D%22Web_Note_16%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cpolygon%20id%3D%22footprint%22%20fill-opacity%3D%220%22%20fill%3D%22%23FFCF57%22%20points%3D%222%202%2018%202%2018%2018%202%2018%22%3E%3C%2Fpolygon%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M12.7272727%2C17%20L6.18181818%2C17%20C4.97636364%2C17%204%2C16.105%204%2C15%20L4%2C5%20C4%2C3.895%204.97636364%2C3%206.18181818%2C3%20L13.8181818%2C3%20C15.0236364%2C3%2016%2C3.895%2016%2C5%20L16%2C14%20L12.7272727%2C17%20L12.7272727%2C17%20Z%20M13%2C15.543%20L14.543%2C14%20L13%2C14%20L13%2C15.543%20L13%2C15.543%20Z%20M6.11111111%2C4%20C5.49777778%2C4%205%2C4.448%205%2C5%20L5%2C15%20C5%2C15.552%205.49777778%2C16%206.11111111%2C16%20L11.9955114%2C16%20L11.9955114%2C13%20L15%2C13%20L15%2C5%20C15%2C4.448%2014.5022222%2C4%2013.8888889%2C4%20L6.11111111%2C4%20Z%20M7%2C9%20L13%2C9%20L13%2C10%20L7%2C10%20L7%2C9%20L7%2C9%20Z%20M7%2C6%20L13%2C6%20L13%2C7%20L7%2C7%20L7%2C6%20L7%2C6%20Z%20M10%2C13%20L7%2C13%20L7%2C12%20L10%2C12%20L10%2C13%20L10%2C13%20Z%22%20id%3D%22icon%22%20fill%3D%22%23424242%22%3E%3C%2Fpath%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E" 
                  alt="" 
                  width="20" 
                  height="20" 
                  /> 
                  }
            </>
      }
  }
}
