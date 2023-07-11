/* 
  This file comes from https://github.com/awehook/blink-mind/blob/3dcacccc4d71352f8c2560b48f4f94fd324cbd7b/packages/renderer-react/src/plugins/hotkey.ts#L1
  The only difference is that op uses e.stopImmediatePropagation(); e.preventDefault(); to prevent event bubbling
  If we don't do that, the hotkey plugin may cause unexpected effects.
  For example, by default <tab> can be used to create a new child.
  If we don't prevent event bubbling, the focus will be lost after the new child is created. Because the <tab> move the cursor outside of the topic.
*/
import { OpType } from '@blink-mind/core';

export interface HotKeyItem {
  label: string;
  combo: string;
  onKeyDown: (e: KeyboardEvent) => any;
}

export type HotKeyMap = Map<string, HotKeyItem>;

export interface HotKeysConfig {
  topicHotKeys: HotKeyMap;
  globalHotKeys: HotKeyMap;
}

export const HotKeyName = {
  ADD_CHILD: 'ADD_CHILD',
  ADD_SIBLING: 'ADD_SIBLING',
  DELETE_TOPIC: 'DELETE_TOPIC',
  EDIT_CONTENT: 'EDIT_CONTENT',
  EDIT_NOTES: 'EDIT_NOTES',
  SET_EDITOR_ROOT: 'SET_EDITOR_ROOT'
};

function op(opType: string, props) {
  const { topicKey, model, controller } = props;
  if (topicKey === undefined) {
    props = { ...props, topicKey: model.focusKey };
  }
  controller.run('operation', { ...props, opType });
}

export function FixHotKeyPlugin() {
  return {
    customizeHotKeys(props, next): HotKeysConfig {
      const { topicHotKeys, globalHotKeys } = next();
      const handleKeyDown = opType => e => {
        op(opType, props);
        e.stopImmediatePropagation();
        e.preventDefault();
      };
      const newTopicHotKeys = new Map<string, HotKeyItem>([
        [
          HotKeyName.ADD_CHILD,
          {
            label: 'add child',
            combo: 'tab',
            onKeyDown: handleKeyDown(OpType.ADD_CHILD)
          }
        ],
        [
          HotKeyName.ADD_SIBLING,
          {
            label: 'add sibling',
            combo: 'enter',
            onKeyDown: handleKeyDown(OpType.ADD_SIBLING)
          }
        ],
        [
          HotKeyName.DELETE_TOPIC,
          {
            label: 'delete topic',
            combo: 'del',
            onKeyDown: handleKeyDown(OpType.DELETE_TOPIC)
          }
        ],
        [
          HotKeyName.EDIT_CONTENT,
          {
            label: 'edit content',
            combo: 'space',
            onKeyDown: handleKeyDown(OpType.START_EDITING_CONTENT)
          }
        ],
        [
          HotKeyName.EDIT_NOTES,
          {
            label: 'edit notes',
            combo: 'alt + d',
            onKeyDown: handleKeyDown(OpType.START_EDITING_DESC)
          }
        ],
        [
          HotKeyName.SET_EDITOR_ROOT,
          {
            label: 'set editor root',
            combo: 'alt + shift + f',
            onKeyDown: handleKeyDown(OpType.SET_EDITOR_ROOT)
          }
        ]
      ]);
      const newGlobalHotKeys = new Map();
      return {
        topicHotKeys: new Map([...topicHotKeys, ...newTopicHotKeys]),
        globalHotKeys: new Map([...globalHotKeys, ...newGlobalHotKeys])
      };
    }
  };
}