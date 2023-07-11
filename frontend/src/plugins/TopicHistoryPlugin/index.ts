import { FocusMode, OpType } from "@blink-mind/core";
import { nonEmpty } from '../../utils';
import { NewOpType as VimHotKeyPluginOpType } from '../VimHotKeyPlugin'

export interface TopicHistory {
    history: string[];
    index: number;
}

export interface GoToNextTopicProps {
    controller: any;
    model: any;
}

export interface GoToPreviosTopicProps {
    controller: any;
    model: any;
}

export const _NOT_INITIALIZED = "NOT_INITIALIZED";

export const TopicHistoryPlugin = () => {
    const topicHistory: TopicHistory = {
        history: new Array(16).fill(_NOT_INITIALIZED),
        index: -1
    }
    return {
        getOpMap: function (props, next) {
            const opMap = next();
            const newFocusTopic = (props) => {
                let { topicKey,
                    includeInHistory: includeInHistory = true,
                    model,
                    focusMode,
                } = props;
                console.log('focus topic');
                const previousTopicKey = model.focusKey;
                if (topicKey !== model.focusKey)
                    model = model.set('focusKey', topicKey);
                if (focusMode !== model.focusMode)
                    model = model.set('focusMode', focusMode);
                if (!includeInHistory)
                    return model;
                // cold start
                if (topicHistory.index === -1 && nonEmpty(previousTopicKey)) {
                    topicHistory.index += 1;
                    topicHistory.history[topicHistory.index] = previousTopicKey;
                } else {
                    if (topicHistory.index === topicHistory.history.length - 1) {
                        topicHistory.history = topicHistory.history.concat(new Array(topicHistory.history.length).fill(_NOT_INITIALIZED))
                    }
                }
                if (topicHistory.history[topicHistory.index] !== topicKey) {
                    topicHistory.index += 1;
                    topicHistory.history[topicHistory.index] = topicKey;
                }
                console.log({ topicHistory });
                return model;
            }
            opMap.set(OpType.FOCUS_TOPIC, newFocusTopic)
            return opMap;
        },
        goToPreviousTopic: function (props: GoToPreviosTopicProps) {
            const { controller } = props;
            if (topicHistory.index === -1 || topicHistory.index === 0)
                return;
            topicHistory.index -= 1;
            const topicKey = topicHistory.history[topicHistory.index];
            controller.run('operation', {
                ...props,
                opType: VimHotKeyPluginOpType.FOCUS_TOPIC_AND_MOVE_TO_CENTER,
                focusMode: FocusMode.NORMAL,
                topicKey,
                includeInHistory: false,
                allowUndo: false
            })
        },
        goToNextTopic: function (props: GoToNextTopicProps) {
            if (
                topicHistory.index === topicHistory.history.length - 1
                || topicHistory.history[topicHistory.index + 1] === _NOT_INITIALIZED
            )
                return;
            const { controller } = props;
            topicHistory.index += 1;
            const topicKey = topicHistory.history[topicHistory.index];
            controller.run('operation', {
                ...props,
                opType: VimHotKeyPluginOpType.FOCUS_TOPIC_AND_MOVE_TO_CENTER,
                topicKey,
                focusMode: FocusMode.NORMAL,
                includeInHistory: false,
                allowUndo: false
            })
        }
    }
}