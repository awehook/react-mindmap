import { BlockType, OpType as StandardOpType, FocusMode as StandardFocusMode } from '@blink-mind/core';
import { Button, Dialog, MenuDivider, MenuItem } from '@blueprintjs/core';
import { Map as ImmutableMap } from 'immutable';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import '../../icon/index.css';
import { JUPYTER_BASE_URL, JUPYTER_CLIENT_ENDPOINT, JUPYTER_CLIENT_TYPE, JUPYTER_ROOT_FOLDER } from './constant';
import { JupyterClient } from './jupyter';
import { log } from './logger';
import { ensureSuffix } from './utils';
import { getDialog } from './dialog';

let jupyterClient = new JupyterClient(JUPYTER_CLIENT_ENDPOINT, {
    jupyterBaseUrl: JUPYTER_BASE_URL,
    rootFolder: JUPYTER_ROOT_FOLDER,
    clientType: JUPYTER_CLIENT_TYPE
});

const getIcon = () => {
    return <div className="icon-jupyter"></div>
}

export const OpType = {
    CREATE_ASSOCIATED_JUPYTER_NOTE: "CREATE_ASSOCIATED_JUPYTER_NOTE",
    DELETE_ASSOCIATED_JUPYTER_NOTE: "DELETE_ASSOCIATED_JUPYTER_NOTE",
}

export const FocusMode = {
    REMOVING_JUPYTER_NOTEBOOK: "REMOVING_JUPYTER_NOTEBOOK",
    NOTIFY_REMOVED_JUPYTER_NOTEBOOK: "NOTIFY_REMOVED_JUPYTER_NOTEBOOK",
    CONFIRM_CREATE_JUPYTER_NOTEBOOK: "CONFIRM_CREATE_JUPYTER_NOTEBOOK"
}

const renderModalRemovingJuyterNotebook = (props) => {
    const { controller } = props;
    const onClickYes = () => {
        controller.run("operation", {
            ...props,
            opArray: [
                {
                    opType: OpType.DELETE_ASSOCIATED_JUPYTER_NOTE
                },
                {
                    opType: StandardOpType.SET_FOCUS_MODE,
                    focusMode: FocusMode.NOTIFY_REMOVED_JUPYTER_NOTEBOOK
                }
            ]
        })
    }

    const onClickNo = () => {
        controller.run('operation', {
            ...props,
            opType: StandardOpType.SET_FOCUS_MODE,
            focusMode: StandardFocusMode.NORMAL
        })
    }

    const dialogProps = {
        key: "renderModalRemovingJuyterNotebook",
        isOpen: true,
        children: <>
            { "Do you want to remove the attached jupyter note?" }
            <Button onClick={ onClickYes }>Yes</Button>
            <Button onClick={ onClickNo }>No</Button> 
        </>
    }
    return <Dialog {...dialogProps} />
}

const renderModalNotifyRemovedJupyterNoteBook = (props) => {
    const { controller } = props;
    const onClickYes = () => {
        controller.run("operation", {
            ...props,
            opArray: [
                {
                    opType: OpType.DELETE_ASSOCIATED_JUPYTER_NOTE
                },
                {
                    opType: StandardOpType.SET_FOCUS_MODE,
                    focusMode: StandardFocusMode.NORMAL
                }
            ]
        })
    }

    const dialogProps = {
        key: "renderModalNotifyRemovedJupyterNote",
        isOpen: true,
        children: <>
            { "The jupyter note has been remove!" }
            <Button onClick={ onClickYes }>Yes</Button>
        </>
    }
    return <Dialog {...dialogProps} />
}

const renderModalConfirmCreateJupyterNotebook = (props) => {
    const { controller } = props;
    const onClickYes = () => {
        createJupyterNote(props);
    }

    const onClickNo = () => {
        controller.run('operation', {
            ...props,
            opType: StandardOpType.SET_FOCUS_MODE,
            focusMode: StandardFocusMode.NORMAL
        })
    }

    return getDialog({
        key:  "renderModalConfirmCreateJupyterNotebook",
        title: "An evernote note is detected to be assocated with the topic. Do you want to create it?",
        buttons: [
            <Button onClick={ onClickYes }>Yes</Button>,
            <Button onClick={ onClickNo }>No</Button>
        ]
    });
}

const focusModeCallbacks = new Map([
    [FocusMode.REMOVING_JUPYTER_NOTEBOOK, renderModalRemovingJuyterNotebook],
    [FocusMode.NOTIFY_REMOVED_JUPYTER_NOTEBOOK, renderModalNotifyRemovedJupyterNoteBook],
    [FocusMode.CONFIRM_CREATE_JUPYTER_NOTEBOOK, renderModalConfirmCreateJupyterNotebook]
])

const getNoteText = ({model, topicKey}) => {
    const topic = model.getTopic(topicKey);
    const block = topic.getBlock(BlockType.CONTENT).block;
    return block.data;
}

const createJupyterNote = (props) => {
    const { controller, model, topicKey } = props;
    const jupyter_notebook_id = uuidv4()
    const jupyter_notebook_path = jupyter_notebook_id + '/' + ensureSuffix(jupyter_notebook_id, ".ipynb")
    const text = getNoteText({model, topicKey})
    jupyterClient.createNote(jupyter_notebook_path, text)
        .then(isSuccess => {
            if (isSuccess)
            {
                controller.run("operation", {
                    ...props,
                    topicKey,
                    jupyter_notebook_path: jupyter_notebook_path,
                    // hack: if no use controller.currentModel, the topic may not correctly be focused
                    model: controller.currentModel,
                    opType: OpType.CREATE_ASSOCIATED_JUPYTER_NOTE
                })

                if (controller.currentModel.focusMode === FocusMode.CONFIRM_CREATE_JUPYTER_NOTEBOOK)
                {
                    controller.run("operation", {
                        ...props,
                        model: controller.currentModel,
                        opType: StandardOpType.SET_FOCUS_MODE,
                        focusMode: FocusMode.NORMAL
                    })
                }
            }
        });
}

export function CreateJupyterNotebookPlugin()
{
  return {
    getOpMap: function(props, next) {
        const opMap = next();
        const { jupyter_notebook_path, topicKey } = props;
        opMap.set(OpType.CREATE_ASSOCIATED_JUPYTER_NOTE, ({ model }) => { 
            const newModel = model.setIn(["extData", "jupyter", topicKey, "path"], jupyter_notebook_path)
            return newModel; 
        });
        opMap.set(OpType.DELETE_ASSOCIATED_JUPYTER_NOTE, ({ model }) => { 
            const newModel = model.deleteIn(['extData', 'jupyter', model.focusKey]);
            return newModel; 
        });

        return opMap;
    },
    renderTopicContentOthers: function(props, next) {
        const { topicKey, model }  = props;
        const jupyterData = model.getIn(['extData', 'jupyter'], new ImmutableMap());
        const res = next();
        return <>
            { res }
            { jupyterData.get(topicKey) &&  getIcon() }
        </>
    },
    customizeTopicContextMenu: function(props, next) {
        log("customizeTopicContextMenu")
        log("parameters: ", props)

        const { topicKey, model, controller } = props;

        const onClickCreateNoteItem = () => {
            log("create note is invoked")
            if (model.getIn(["extData", "jupyter", topicKey]))
            {
                alert("Can't associate jupyter note on a topic which already associates a jupyter note!")
                return 
            }
            if (model.getIn(["extData", "evernote", topicKey]))
            {
                controller.run('operation', {
                    ...props,
                    opType: StandardOpType.SET_FOCUS_MODE,
                    focusMode: FocusMode.CONFIRM_CREATE_JUPYTER_NOTEBOOK
                })
                return
            }
            createJupyterNote(props)
        }

        const onClickOpenJupyterNoteItem = () => {
            const { model, topicKey } = props;
            const jupyter_notebook_path = model.getIn(['extData', 'jupyter', topicKey, "path"])
            if (jupyter_notebook_path)
            {
                const url = jupyterClient.getActualUrl(jupyter_notebook_path)
                log(`Opening ${url}`)
                window.open(url, '_blank').focus()
            }
            else 
            {
                alert("No jupyter notebook is attachd");
            }
        }

        const onClickRemoveJupyterNoteItem = () => {
            const { controller } = props;
            controller.run('operation', {
                ...props,
                opType: StandardOpType.SET_FOCUS_MODE,
                // hack: if no use controller.currentModel, the topic may not correctly be focused
                model: controller.currentModel,
                focusMode: FocusMode.REMOVING_JUPYTER_NOTEBOOK,
            })
        }

        const createJupyterNoteItem = <MenuItem
              icon={ getIcon() }
              key={"create note"}
              text={ "Create jupyter note" }
              // labelElement={<kbd>{ "Ctrl + a" }</kbd>}
              onClick={onClickCreateNoteItem}
            />

        const openJupyterNoteItem = <MenuItem
              icon={ getIcon() }
              key={"open jupyter note"}
              text={ "Open jupyter note" }
              // labelElement={<kbd>{ "Ctrl + a" }</kbd>}
              onClick={onClickOpenJupyterNoteItem}
            />

        const removeJupyterNoteItem = <MenuItem
              icon={ getIcon() }
              key={"remove jupyter note"}
              text={ "Remove jupyter note" }
              // labelElement={<kbd>{ "Ctrl + a" }</kbd>}
              onClick={onClickRemoveJupyterNoteItem}
            />
        
        const jupyterData = model.getIn(["extData", "jupyter"], new ImmutableMap());
        const associatedWithJupyterNote = jupyterData.has(topicKey)

      return <>
          { next() }
          { <MenuDivider />}
          { createJupyterNoteItem }
          { associatedWithJupyterNote && openJupyterNoteItem }
          { associatedWithJupyterNote && removeJupyterNoteItem }
      </>;
    },

    renderModal: (props, next) => {
        const { model: { focusMode } } = props;
        const res = next();
        if (!focusModeCallbacks.has(focusMode))
            return res;

        const newRes = focusModeCallbacks.get(focusMode)(props)

        return res === null ? [ newRes ] : [ ...res, newRes ]
    },

    getAllowUndo(props, next) {
        const res = next();
        if (!res)
            return false;
        const { model } = props;
        if (FocusMode.hasOwnProperty(model.focusMode))
            return false;
        return res;
    },

    deserializeExtData: (props, next) => {
      const extData = next();
      let newExtData = extData;
      const jupyterData = extData.get('jupyter')
      if (jupyterData)
          newExtData = extData.set('jupyter', new ImmutableMap(jupyterData));
      return newExtData;
    }
  }
}