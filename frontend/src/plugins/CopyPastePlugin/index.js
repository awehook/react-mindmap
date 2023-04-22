import React from "react";
import debug from 'debug';
import { MenuItem } from "@blueprintjs/core";
import { getAllSubTopicKeys } from "@blink-mind/core";
import { Icon } from "../../icon";
import "../../icon/index.css";

const log = debug('app:plugin:CopyPastePlugin')

const additionalOptions = {
    SET_COPIED_ROOT: (props) => {
        const { model, topicKey } = props;
        const newModel = model.setIn(["extData", "copyAndPastePlugin", "CopiedTopicRoot"], topicKey);
        console.log(`${getAllSubTopicKeys(model, topicKey).length} notes has been copied!`);
        return newModel;
    },
    PASTE_NOTE: (props) => {
        log("paste note started")
        const { model, topicKey: dstTopicKey } = props;
        log(model.topics.toJS())
        const copiedTopicKey = model.getIn(["extData", "copyAndPastePlugin", "CopiedTopicRoot"])
        let copiedTopic = model.getTopic(copiedTopicKey)

        log({ dstTopicKey, copiedTopicKey })
        if (!dstTopicKey 
                    || !copiedTopicKey
                    || dstTopicKey === copiedTopicKey 
                    || dstTopicKey === copiedTopic.parentKey)
            return model;
        const newModel = model.withMutations(m => {
            m.deleteIn(["extData", "copyAndPastePlugin", "CopiedTopicRoot"])
             .updateIn(['topics', copiedTopic.parentKey, 'subKeys'], 
                        subKeys => subKeys.delete(subKeys.indexOf(copiedTopicKey))
             )
             .setIn(['topics', copiedTopicKey, 'parentKey'], dstTopicKey)
             .updateIn(['topics', dstTopicKey, 'subKeys'], 
                        subKeys => subKeys.push(copiedTopicKey)
            )
        })
        log(newModel.topics.toJS())
        log("paste note finished!")
        return newModel;
    }
}
const additionalOpTypes = {
    SET_COPIED_ROOT: "SET_COPIED_ROOT",
    PASTE_NOTE: "PASTE_NOTE",
}

function op(opType, props) {
    const { topicKey, model, controller } = props;
    if (topicKey === undefined) {
      props = { ...props, topicKey: model.focusKey };
    }
    controller.run('operation', { ...props, opType });
}

export function CopyPastePlugin() {
  return {
    getOpMap(props, next) {
        const opMap = next();
        var newOperationLists = Object.keys(additionalOptions).map(k => [k, additionalOptions[k]])
        const newMap = new Map([...opMap, ...newOperationLists])
        return newMap;
    },
    customizeHotKeys: function (props, next) {
        const handleHotKeyDown = opType => e => {
            op(opType, props)
            e.stopImmediatePropagation();
            e.preventDefault();
        };
        const res = next();
        const {topicHotKeys, globalHotKeys}  = res;
        const newTopicHotKeys = new Map([
            [
                additionalOpTypes.SET_COPIED_ROOT,
                {
                    label: 'cut notes',
                    combo: 'mod + x',
                    allowInInput: true,
                    onKeyDown: handleHotKeyDown(additionalOpTypes.SET_COPIED_ROOT)
                }
            ],
            [
                additionalOpTypes.PASTE_NOTE,
                {
                    label: 'paste notes',
                    combo: 'mod + v',
                    allowInInput: true,
                    onKeyDown: handleHotKeyDown(additionalOpTypes.PASTE_NOTE)
                    // onKeyDown: () => alert("hello")
                }
            ]
        ])
        return {
            topicHotKeys: new Map([...topicHotKeys, ...newTopicHotKeys]),
            globalHotKeys,
        }
    },
    customizeTopicContextMenu: function(props, next) {
        log("customizeTopicContextMenu")
        log("parameters: ")
        log({ props })

        const { topicKey, model, controller } = props;
        const isRoot = topicKey === model.rootTopicKey;
        const onClickCutItem = () => { 
            log("Cut is invoked")
            controller.run("operation", {
                ...props,
                model: controller.currentModel,
                opType: additionalOpTypes.SET_COPIED_ROOT
            })
        } 
        const onClickPasteItem = () => {
            log("Paste is invoked")
            controller.run("operation", {
                ...props,
                model: controller.currentModel,
                opType: additionalOpTypes.PASTE_NOTE
            })
        }
        const copyNodeItem = <MenuItem
              icon={ Icon("edit-cut") }
              key={"cut nodes"}
              text={ "cut notes" }
              labelElement={<kbd>{ "Ctrl + x" }</kbd>}
              onClick={onClickCutItem}
            />
        const pasteNodeItem = <MenuItem
              icon={Icon("paste")}
              key={"paste nodes"}
              text={ "paste notes" }
              labelElement={<kbd>{ "Ctrl + v" }</kbd>}
              onClick={onClickPasteItem}
            />
    
      return <>
          { next() }
          { isRoot || copyNodeItem }
          { pasteNodeItem }
      </>;
    }
  }
}