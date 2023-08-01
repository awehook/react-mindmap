// @ts-check
import debug from "debug";
import { DEFAULT_INTERVAL_5m } from "../../constants";
import { DbConnectionFactory } from "../../db/db";
import { md5 } from "../../utils/md5";
import { retrieveResultFromNextNode } from "../../utils/retrieveResultFromNextNode";

const log = debug("plugin:AutoSyncPlugin");
const connection = DbConnectionFactory.getDbConnection()

const uploadGraph = async ({ controller, model, callback }) => {
    controller.run('operation', { controller, model, opType: 'moveVersionForward' });
    const newModel = controller.currentModel;
    const parentVersion = controller.run('getParentVersion', { controller, model: newModel });
    const version = controller.run('getVersion', { controller, model: newModel });
    const serializedModel = controller.run('serializeModel', { controller, model: newModel });
    const serializedModelJson = JSON.stringify(serializedModel)
    await connection.push(serializedModelJson, parentVersion, version);
    log("Auto sync successfully!");
    callback && callback();
}

async function saveCache({ controller }, callback = () => { }) {

    const model = controller.currentModel;
    log(`Try to auto-sync at ${new Date()}`, { controller, model });
    if (!model) {
        log("model is null");
        return;
    }
    const remoteGraph = (await connection.pull()).data;

    const version = controller.run('getVersion', { controller, model })
    const workingTreeVersion = controller.run('getWorkingTreeVersion', { controller, model: controller.currentModel });
    log({ remoteGraph, model, version, workingTreeVersion });

    const upload = async () => await uploadGraph({ controller, model, callback });

    if (remoteGraph === undefined) {
        log("Failed to get remoteGraph");
        return;
    }

    if (remoteGraph === null) {
        log("The remote graph is null. Uploading the local graph.");
        await upload();
        return;
    }

    if (remoteGraph.version === null) {
        log("No remote version or current version");
        await upload();
        return;
    }
    if (remoteGraph.version === version) {
        log("The remote graph is the same as the local graph.")
        if (version === workingTreeVersion) {
            log("No need to push data to the cloud because the working tree is the same.");
        } else {
            log("The local graph is updated based on the remote graph, uploading the local graph");
            await upload();
        }
        return;
    }
    log("The remote graph conflicts with the local graph. Please try to take actions to resolve the conflicts!");
}

export function AutoSyncPlugin() {
    return {
        getOpMap(props, next) {
            const opMap = next();
            opMap.set("moveVersionForward", ({ controller, model }) => {
                const version = controller.run('getVersion', { controller, model });
                const workingTreeVersion = controller.run('getWorkingTreeVersion', { controller, model });
                const newModel = model.setIn(["extData", "versionInfo", 'parentVersion'], version)
                    .setIn(["extData", "versionInfo", 'version'], workingTreeVersion);
                return newModel;
            });
            return opMap;
        },

        getParentVersion({ controller, model }) {
            const parentVersion = model.getIn(['extData', 'versionInfo', 'parentVersion'], null);
            return parentVersion;
        },

        getWorkingTreeVersion({ controller, model }) {
            const serializedModel = controller.run("serializeModel", { controller, model });
            delete serializedModel.extData.versionInfo;
            const jsonStr = JSON.stringify(serializedModel);
            const version = md5(jsonStr);
            return version;
        },

        getVersion({ controller, model }) {
            return model.getIn(['extData', 'versionInfo', 'version'], null)
                ?? controller.run('getWorkingTreeVersion', { controller, model });
        },

        startRegularJob(props, next) {
            const res = retrieveResultFromNextNode(next)

            // autoSave per 60s
            const autoSyncModel = () => setInterval(() => saveCache(props).then(res => { }), DEFAULT_INTERVAL_5m);
            res.push({
                funcName: autoSyncModel.name,
                func: autoSyncModel
            });
            return res;
        },

        deserializeExtData: (props, next) => {
            next();
            const { extData } = props;
            if (!extData?.versionInfo) {
                extData.versionInfo = {
                    version: '000000000',
                    parentVersion: '000000000',
                }
            }
            return null;
        }
    }
}