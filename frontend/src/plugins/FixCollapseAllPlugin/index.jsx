import debug from "debug";
import { getAllSubTopicKeys, ModelModifier, OpType } from "@blink-mind/core";

const log = debug("app");

export function FixCollapseAllPlugin() {
  return {
      getOpMap(ctx, next) {
        const opMap = next();

        // fixed version based on https://github.com/awehook/blink-mind/blob/3dcacccc4d71352f8c2560b48f4f94fd324cbd7b/packages/core/src/models/modifiers/modifiers.ts#L36
        const collapseAll = ({ model }) => {
          log('collapseAll');
          const topicKeys = getAllSubTopicKeys(model, model.editorRootTopicKey);
          log(model);
          model = model.withMutations(m => {
            topicKeys.forEach(topicKey => {
              m.setIn(['topics', topicKey, 'collapse'], true);
            });
          });
          // focus to root topic to avoid referencing unrendered topics
          model = ModelModifier.focusTopic({ model, topicKey: model.editorRootTopicKey });
          log(model);
          return model;
        }

        opMap.set(OpType.COLLAPSE_ALL, collapseAll)
        return opMap;
      }
  }
}
