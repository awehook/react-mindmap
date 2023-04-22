import { OpType, getAllSubTopicKeys } from "@blink-mind/core";
import { Map as ImmutableMap } from "immutable";
import { FOCUS_MODE_SEARCH_NOTE_TO_ATTACH } from "../EvernoteSearchPlugin";
import { getEnv } from "../../utils";

export const NEW_OPERATION_OPTIONS = {
    ADD_NOTE_RELATION: (props) => {
        const { topicKey, note, model } = props;
        let newModel = model;
        if (!model.getIn(['extData', 'evernote'])) {
            newModel = model.setIn(['extData', 'evernote'], new ImmutableMap());
        }
        newModel = newModel.updateIn(['extData', 'evernote'], m => m.set(topicKey, note));
        return newModel;
    }, 
    DELETE_NOTE_RELATION: (props) => {
        const { topicKey, model } = props;
        let newModel = model;
        const allDeleteKeys = getAllSubTopicKeys(newModel, topicKey);
        for (let key of [...allDeleteKeys, topicKey]) {
            newModel = newModel.deleteIn(['extData', 'evernote', key]);
        }
        return newModel;
    },
    ASSOCIATE_A_NOTE: (props) => {
        let { controller } = props;
        controller.run('operation', { ...props, focusMode: FOCUS_MODE_SEARCH_NOTE_TO_ATTACH, opType: OpType.FOCUS_TOPIC })
        return controller.currentModel;
    },
    OPEN_EVERNOTE_LINK: (props) => {
        const { topicKey, controller } = props;
        const note = controller.currentModel.getIn(["extData", "evernote", topicKey]);
        if (note !== undefined) {
            const shardId = getEnv("REACT_APP_EVERNOTE_SHARD_ID")
            const userId = getEnv("REACT_APP_EVERNOTE_USER_ID")
            const url = `evernote:///view/${userId}/${shardId}/${note.guid}/${note.guid}/`
            window.open(url, '_blank').focus();
        } else {
            alert(`Topic doesn't have an associated note`);
        }
        return controller.currentModel;
    }
}

export function AddNewOperationsPlugin()
{
    return {
      beforeOpFunction: (props) => {
        const { opType, topicKey, model, controller } = props;
          if (
            opType === OpType.DELETE_TOPIC &&
            topicKey !== model.editorRootTopicKey
          ) {
              controller.run(
                'operation',
                { ...props, 
                  opType: 'DELETE_NOTE_RELATION',
                });
              return controller.currentModel;
          } else {
              return model;
          }
      },
      getOpMap: function(ctx, next) {
          let opMap = next();
          return new Map([...opMap, ...Object.keys(NEW_OPERATION_OPTIONS).map(key => [key, NEW_OPERATION_OPTIONS[key]])]);
      }
    }
}