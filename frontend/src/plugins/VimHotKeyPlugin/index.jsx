import '../../icon/index.css';
import { FOCUS_MODE_SEARCH } from '../NewSearchPlugin/utils';

import { FocusMode, OpType, } from "@blink-mind/core";
import { empty, isTopicVisible } from '../../utils';
import { createJupyterNote, openJupyterNotebookFromTopic } from '../CreateJupyterNotebookPlugin';
import { hasJupyterNotebookAttached } from '../CreateJupyterNotebookPlugin/utils';
import { OpType as EvernoteRelatedOpType } from '../EvernotePlugin';
import { hasEvernoteAttached } from '../EvernotePlugin/utils';

export const NewOpType = {
  FOCUS_TOPIC_AND_MOVE_TO_CENTER: "FOCUS_TOPIC_AND_MOVE_TO_CENTER"
}

function op(opType, props) {
  const { topicKey, controller } = props;
  if (topicKey === undefined) {
    props = { ...props, topicKey: controller.currentModel.focusKey };
  }
  controller.run('operation', { ...props, opType });
}

const getSiblingTopicKey = (topicKey, model, offset) => {
  const parentTopic = model.getParentTopic(topicKey);
  if (empty(parentTopic) || !isTopicVisible(model, parentTopic.key))
    return undefined;
  const siblingTopicKeys = parentTopic.subKeys
  const siblingKeyCount = siblingTopicKeys.size
  if (siblingKeyCount === 0) return null;
  if (siblingKeyCount === 1) return topicKey;

  const index = siblingTopicKeys.findIndex(key => key == topicKey);
  const siblingIndex = (index + offset + siblingKeyCount) % siblingKeyCount;
  return siblingTopicKeys.get(siblingIndex);
}

const getSiblingTopicKeyCrossParent = (topicKey, model, offset) => {
  const parentTopic = model.getParentTopic(topicKey);
  if (empty(parentTopic) || !isTopicVisible(model, parentTopic.key))
    return undefined;
  const parentParentTopic = model.getParentTopic(parentTopic.key);
  if (empty(parentParentTopic) || !isTopicVisible(model, parentParentTopic.key))
    return undefined;
  const globalSiblingTopicKeys = parentParentTopic.subKeys
    .map(key => model.getTopic(key).subKeys)
    .reduce((prev, cur) => [...prev, ...cur], []);
  const siblingKeyCount = globalSiblingTopicKeys.length
  if (siblingKeyCount === 1) return topicKey;

  const index = globalSiblingTopicKeys.findIndex(key => key === topicKey);
  const siblingIndex = (index + offset + siblingKeyCount) % siblingKeyCount;
  return globalSiblingTopicKeys[siblingIndex];
}

const getParentTopicKeyFromController = ({ controller }) => {
  const model = controller.currentModel;
  const topicKey = model.focusKey;
  const parentKey = model.getParentTopic(topicKey)?.key;
  return parentKey;
}

const getNextSiblingOrParentTopicKey = (topicKey, model, offset) => {
  const nextSiblingTopicKey = getSiblingTopicKey(topicKey, model, offset);
  if (!nextSiblingTopicKey || nextSiblingTopicKey === topicKey)
    return model.getParentTopic(topicKey)?.key;
  return nextSiblingTopicKey;
}

export const HOTKEYS = {
  VIM_TOGGLE_COLLAPSE: "VIM_TOGGLE_COLLAPSE",
  VIM_GO_TO_PARENT: "VIM_GO_TO_PARENT",
  VIM_GO_TO_CHILD: "VIM_GO_TO_CHILD",
  VIM_GO_TO_NEXT_SIBING: "VIM_GO_TO_NEXT_SIBING",
  VIM_GO_TO_PREV_SIBING: "VIM_GO_TO_PREV_SIBING",
  VIM_GO_TO_FIRST_SIBLING: "VIM_GO_TO_FIRST_SIBLING",
  VIM_GO_TO_LAST_SIBLING: "VIM_GO_TO_LAST_SIBLING",
  VIM_DELETE_NOTE: "VIM_DELETE_NOTE",
  VIM_EDIT_CONTENT: "VIM_EDIT_CONTENT",
  VIM_SET_AS_EIDTOR_ROOT: "VIM_SET_AS_EIDTOR_ROOT",
  VIM_UNDO: "VIM_UNDO",
  VIM_REDO: "VIM_REDO",
  VIM_TOGGLE_COLLAPSE_ALL: "VIM_TOGGLE_COLLAPSE_ALL",
  VIM_CENTER_TO_TOPIC: "VIM_CENTER_TO_TOPIC",
  VIM_SEARCH_TOPICS: "VIM_SEARCH_TOPICS",
  VIM_NEW_JUPYTER_NOTEBOOK: "VIM_NEW_JUPYTER_NOTEBOOK",
  VIM_OPEN_EVERNOTE_NOTE_OR_JUPYTER_NOTEBOOK: "VIM_OPEN_EVERNOTE_NOTE_OR_JUPYTER_NOTEBOOK",
  VIM_ESCAPE_ESC: "VIM_ESCAPE_ESC",
  VIM_ESCAPE_CTRL_PLUS_RIGHT_SQUARE_BRACKET: "VIM_ESCAPE_CTRL_PLUS_RIGHT_SQUARE_BRACKET",
  VIM_GO_TO_PREVIOUS_TOPIC: "VIM_GO_TO_PREVIOUS_TOPIC",
  VIM_GO_TO_NEXT_TOPIC: "VIM_GO_TO_NEXT_TOPIC"
}

export function VimHotKeyPlugin() {
  let all_collapsed = false;
  return {
    getOpMap: function (props, next) {
      const opMap = next();
      opMap.set(NewOpType.FOCUS_TOPIC_AND_MOVE_TO_CENTER, (props) => {
        const {
          controller,
          topicKey,
          focusMode: focusMode = FocusMode.NORMAL,
          allowUndo,
          includeInHistory
        } = props;
        delete props['opType'];
        controller.run('operation', {
          ...props,
          opArray: [
            {
              opType: OpType.FOCUS_TOPIC,
              topicKey,
              focusMode,
              allowUndo,
              includeInHistory
            },
            {
              opType: OpType.EXPAND_TO,
              topicKey
            }
          ],
          callback: () => {
            controller.run('moveTopicToCenter', { ...props, topicKey });
          }
        });
        return controller.currentModel;
      });
      return opMap;
    },
    customizeHotKeys: function (props, next) {
      const handleHotKeyDown = (opType, opArg) => e => {
        // log('HotKeyPlugin', opType);
        op(opType, { ...props, ...opArg });
        e.stopImmediatePropagation();
        e.preventDefault();
      };

      const handleFocusTopic = (topicKey) => e => {
        const { controller } = props;
        const opArg = {
          topicKey: topicKey,
          focusMode: FocusMode.NORMAL,
          model: controller.currentModel,
          allowUndo: false
        }
        handleHotKeyDown(NewOpType.FOCUS_TOPIC_AND_MOVE_TO_CENTER, opArg)(e);
      }

      const handleGoToSibling = offset => e => {
        const { controller } = props;
        const model = controller.currentModel;
        const currentKey = model.focusKey;

        let nextSiblingKey;
        nextSiblingKey = getSiblingTopicKeyCrossParent(currentKey, model, offset);
        if (empty(nextSiblingKey) || !isTopicVisible(model, nextSiblingKey)) {
          console.log(`nextSiblingKey of ${currentKey} is empty`);
          nextSiblingKey = getSiblingTopicKey(currentKey, model, offset);
          if (empty(nextSiblingKey)) {
            console.log(`nextSiblingKey of ${currentKey} is empty`);
            return;
          }
        }
        handleFocusTopic(nextSiblingKey)(e)
      }

      const res = next();
      const { topicHotKeys, globalHotKeys } = res;
      const newTopicHotKeys = new Map([
        [
          HOTKEYS.VIM_TOGGLE_COLLAPSE,
          {
            label: 'toggle collapse',
            combo: 'o',
            allowInInput: true,
            onKeyDown: handleHotKeyDown('TOGGLE_COLLAPSE', { allowUndo: false })
          }
        ],
        [
          HOTKEYS.VIM_GO_TO_PARENT,
          {
            label: 'associate notes',
            combo: 'h',
            rootCanUse: false,
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              const model = controller.currentModel;
              if (model.focusKey === model.rootTopicKey)
                return;
              // a non-root topic key must have a parentKey
              const parentKey = getParentTopicKeyFromController(props);
              if (!isTopicVisible(model, parentKey)) {
                controller.run('operation', {
                  ...props,
                  topicKey: parentKey,
                  opType: OpType.SET_EDITOR_ROOT,
                  allowUndo: false,
                })
              }
              handleFocusTopic(parentKey)(e)
            }
          }
        ],
        [
          HOTKEYS.VIM_GO_TO_CHILD,
          {
            label: 'associate notes',
            combo: 'l',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              const model = controller.currentModel;
              const currentKey = model.focusKey;
              const currentTopic = model.getTopic(currentKey)
              const subKeyCount = currentTopic.subKeys.size
              const midPoint = Math.trunc(subKeyCount / 2)
              const firstSubKey = currentTopic.subKeys.get(midPoint);
              if (firstSubKey === undefined) return;
              if (currentTopic.collapse) {
                controller.run('operation', {
                  opType: OpType.TOGGLE_COLLAPSE, topicKey: currentKey, ...props
                });
              }
              handleFocusTopic(firstSubKey)(e);
            }
          }
        ],
        [
          HOTKEYS.VIM_GO_TO_NEXT_SIBING,
          {
            label: 'associate notes',
            combo: 'j',
            allowInInput: true,
            onKeyDown: handleGoToSibling(1)
          }
        ],
        [
          HOTKEYS.VIM_GO_TO_PREV_SIBING,
          {
            label: 'associate notes',
            combo: 'k',
            allowInInput: true,
            onKeyDown: handleGoToSibling(-1)
          }
        ],
        [
          HOTKEYS.VIM_GO_TO_FIRST_SIBLING,
          {
            label: 'go to first sibling',
            combo: 'g',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              const model = controller.currentModel;
              const currentKey = model.focusKey;
              const siblingTopicKeys = model.getParentTopic(currentKey).subKeys
              const firstSiblingTopicKey = siblingTopicKeys.get(0);
              handleFocusTopic(firstSiblingTopicKey)(e);
            }
          }
        ],
        [
          HOTKEYS.VIM_GO_TO_LAST_SIBLING,
          {
            label: 'go to last sibling',
            combo: 'shift + g',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              const model = controller.currentModel;
              const currentKey = model.focusKey;
              const siblingTopicKeys = model.getParentTopic(currentKey).subKeys
              const lastSiblingTopicKey = siblingTopicKeys.get(siblingTopicKeys.size - 1);
              handleFocusTopic(lastSiblingTopicKey)(e);
            }
          }
        ],
        [
          HOTKEYS.VIM_DELETE_NOTE,
          {
            label: 'associate notes',
            combo: 'd',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              const model = controller.currentModel;
              const nextFocusTopicKey = getNextSiblingOrParentTopicKey(model.focusKey, model, 1);
              handleHotKeyDown(OpType.DELETE_TOPIC)(e);
              const opArg = {
                opType: NewOpType.FOCUS_TOPIC_AND_MOVE_TO_CENTER,
                topicKey: nextFocusTopicKey,
                focusMode: FocusMode.NORMAL,
                model: controller.currentModel
              }
              controller.run('operation', { ...props, ...opArg })
            }
          }
        ],
        [
          HOTKEYS.VIM_EDIT_CONTENT,
          {
            label: 'edit the note content',
            combo: 'e',
            allowInInput: true,
            onKeyDown: handleHotKeyDown(OpType.START_EDITING_CONTENT)
          }
        ],
        [
          HOTKEYS.VIM_SET_AS_EIDTOR_ROOT,
          {
            label: 'set as editor root',
            combo: 'r',
            allowInInput: true,
            onKeyDown: handleHotKeyDown(OpType.SET_EDITOR_ROOT)
          }
        ],
        [
          HOTKEYS.VIM_UNDO,
          {
            label: 'undo',
            combo: 'u',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              controller.run('undo', { ...props })
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          }
        ],
        [
          HOTKEYS.VIM_REDO,
          {
            label: 'redo',
            combo: 'shift + u',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              controller.run('redo', { ...props })
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          }
        ],
        [
          HOTKEYS.VIM_TOGGLE_COLLAPSE_ALL,
          {
            label: 'collapse all',
            combo: 'shift + o',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              const model = controller.currentModel;
              const opType = all_collapsed ? OpType.EXPAND_ALL : OpType.COLLAPSE_ALL;
              controller.run('operation', { ...props, model, opType, allowUndo: false });
              // all_collapsed = !all_collapsed;
              // do not support expand all as of now because the expand all may make the page stuck when there are too many nodes.
              e.stopImmediatePropagation();
              e.preventDefault();
            },
          }
        ],
        [
          HOTKEYS.VIM_CENTER_TO_TOPIC,
          {
            label: 'center to topic',
            combo: 'c',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              const model = controller.currentModel;
              controller.run('moveTopicToCenter', {
                ...props,
                model,
                topicKey: model.focusKey,
                allowUndo: false
              });
              e.stopImmediatePropagation();
              e.preventDefault();
            },
          }
        ],
        [
          HOTKEYS.VIM_SEARCH_TOPICS,
          {
            label: 'search topics',
            combo: '/',
            allowInInput: true,
            onKeyDown: handleHotKeyDown(OpType.SET_FOCUS_MODE, {
              ...props, focusMode: FOCUS_MODE_SEARCH
            })
          }
        ],
        [
          HOTKEYS.VIM_OPEN_EVERNOTE_NOTE_OR_JUPYTER_NOTEBOOK,
          {
            label: 'open evernote and jupyter',
            combo: '.',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              const model = controller.currentModel;
              if (hasJupyterNotebookAttached({ model })) {
                openJupyterNotebookFromTopic({ model });
                e.stopImmediatePropagation();
                e.preventDefault();
              }
              else if (hasEvernoteAttached({ model })) {
                handleHotKeyDown(EvernoteRelatedOpType.OPEN_EVERNOTE_LINK)(e);
              }
            }
          }
        ],
        [
          HOTKEYS.VIM_NEW_JUPYTER_NOTEBOOK,
          {
            label: 'create a new jupyter notebook',
            combo: 'n',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              const model = controller.currentModel;
              createJupyterNote({ controller, model, topicKey: model.focusKey });
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          }
        ],
      ]);
      const newGlobalHotKeys = new Map([
        [
          HOTKEYS.VIM_ESCAPE_ESC,
          {
            label: 'Escape',
            combo: 'esc',
            allowInInput: true,
            onKeyDown: handleHotKeyDown(NewOpType.FOCUS_TOPIC_AND_MOVE_TO_CENTER, { focusMode: FocusMode.NORMAL, allowUndo: false })
          }
        ],
        [
          HOTKEYS.VIM_ESCAPE_CTRL_PLUS_RIGHT_SQUARE_BRACKET,
          {
            label: 'Escape',
            combo: 'ctrl + ]',
            allowInInput: true,
            onKeyDown: handleHotKeyDown(NewOpType.FOCUS_TOPIC_AND_MOVE_TO_CENTER, { focusMode: FocusMode.NORMAL, allowUndo: false })
          }
        ],
        [
          HOTKEYS.VIM_GO_TO_PREVIOUS_TOPIC,
          {
            label: 'Escape',
            combo: 'ctrl + o',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              controller.run("goToPreviousTopic", { ...props, allowUndo: false });
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          }
        ],
        [
          HOTKEYS.VIM_GO_TO_NEXT_TOPIC,
          {
            label: 'Escape',
            combo: 'ctrl + i',
            allowInInput: true,
            onKeyDown: (e) => {
              const { controller } = props;
              controller.run("goToNextTopic", { ...props, allowUndo: false });
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          }
        ]
      ]);
      return {
        topicHotKeys: new Map([...topicHotKeys, ...newTopicHotKeys]),
        globalHotKeys: new Map([...globalHotKeys, ...newGlobalHotKeys])
      };
    }
  }
}