// @ts-check
import { Button } from "@blueprintjs/core";
import debug from "debug";
import localforage from "localforage";
import React from "react";
import { DEFAULT_INTERVAL_60S } from "../../constants";
import { retrieveResultFromNextNode } from "../../utils/retrieveResultFromNextNode";

const log = debug("plugin:AutoSaveModelPlugin");

function saveCache({ controller }, callback = () => { }) {
    const model = controller.currentModel;
    log(`Auto-Saved at ${new Date()}`, { controller, model });
    if (model) {
        const serializedModel = controller.run('serializeModel', { controller, model });
        localforage.setItem('react-mindmap-evernote-mind', JSON.stringify(serializedModel));
        callback();
    }
}

const CacheButton = (props) => {
    const { controller } = props;
    const buttonProps = {
        style: { height: "40px" },
        onClick: () => saveCache({ controller }, () => { alert(`Saved at ${new Date()}`) })
    }
    return <div>
        <Button {...buttonProps}> Save Cache </Button>
    </div>;
}

export function AutoSaveModelPlugin() {
    return {
        startRegularJob(props, next) {
            const res = retrieveResultFromNextNode(next)
            // autoSave per 60s
            const autoSaveModel = () => setInterval(() => saveCache(props), DEFAULT_INTERVAL_60S);
            res.push({
                funcName: "autoSaveModel",
                func: autoSaveModel
            });
            return res;
        },
        renderLeftBottomCorner(props, next) {
            const res = retrieveResultFromNextNode(next);
            res.push(<CacheButton {...props} />);
            return res;
        }
    }
}
