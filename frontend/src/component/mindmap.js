import { OpType } from "@blink-mind/core";
import { Button, Classes, Dialog } from "@blueprintjs/core";
import localforage from 'localforage';
import React from "react";
// import RichTextEditorPlugin from "@blink-mind/plugin-rich-text-editor";
import { Controller } from '@blink-mind/core';
import { JsonSerializerPlugin } from "@blink-mind/plugin-json-serializer";
import { ThemeSelectorPlugin } from "@blink-mind/plugin-theme-selector";
import TopologyDiagramPlugin from "@blink-mind/plugin-topology-diagram";
import { TopicReferencePlugin } from "@blink-mind/plugins";
import { DefaultPlugin } from '@blink-mind/renderer-react';
import "@blink-mind/renderer-react/lib/main.css";
import debug from "debug";
import memoizeOne from 'memoize-one';
import { getAllNotes, getNotebookList, mergeNotes } from "../evernote/noteHelper";
import {
  AddNewOperationsPlugin,
  CounterPlugin,
  CustomizeJsonSerializerPlugin,
  DebugPlugin,
  EvernoteSearchPlugin,
  FixCollapseAllPlugin,
  HotKeyPlugin,
  NewSearchPlugin,
  CopyPastePlugin,
  CreateJupyterNotebookPlugin
} from '../plugins';
import { generateSimpleModel, getNotesFromModel } from "../utils";
import { Toolbar } from "./toolbar/toolbar";
import { StandardDebugPlugin } from "../plugins/StandardDebugPlugin/debug-plugin";

const log = debug("app");

const ViewModeMindMap = 'MindMap'

const plugins = [
  // RichTextEditorPlugin(),
  DebugPlugin(),
  StandardDebugPlugin(),
  CustomizeJsonSerializerPlugin(),
  AddNewOperationsPlugin(),
  FixCollapseAllPlugin(),
  CounterPlugin(),
  CreateJupyterNotebookPlugin(),
  HotKeyPlugin(),
  ThemeSelectorPlugin(),
  TopicReferencePlugin(),
  NewSearchPlugin(),
  EvernoteSearchPlugin(),
  TopologyDiagramPlugin(),
  JsonSerializerPlugin(),
  CopyPastePlugin(),
];

class MyController extends Controller {
  // override the change interface of Controller to first change currentModel and then call onChange
  change(model, callback) {
    this.currentModel = model;
    this.onChange(model, callback);
  }
}

export class Mindmap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      model: generateSimpleModel(),
      initialized: false,
      loadFromCached: false,
      dialog: {
        isOpen: false,
        children: "",
        intent: "primary",
        minimal:true
      }
    }
    this.controller = this.resolveController(plugins, DefaultPlugin);
  }

  openNewModel = (newModel) => {
    const props = this.controller.run('getDiagramProps');
    const { model, getRef } = props;
    this.controller.run('deleteRefKey', {
      ...props,
      topicKey: model.rootTopicKey
    });
    this.controller.run('operation', {
      ...props,
      opType: OpType.EXPAND_TO,
      topicKey: newModel.focusKey,
      model: newModel,
      callback: () => {
        this.controller.run('moveTopicToCenter', {
          getRef,
          model: newModel,
          topicKey: newModel.focusKey
        });
      }
    });
  }

  openDialog = (dialog) => {
    this.setDialog(dialog)
  }

  closeDialog = () => {
    this.setDialog({ isOpen: false })
  }

  setDialog = (dialog) => {
    this.setState({ dialog })
  }

  resolveController = memoizeOne((plugins = [], TheDefaultPlugin) => {
    const defaultPlugin = TheDefaultPlugin();
    return new MyController({
      plugins: [plugins, defaultPlugin],
      construct: false,
      onChange: this.onChange
    });
    // this.controller.currentModel = this.state.model;
    // this.controller.run('onConstruct');
  });

  onClickUndo = e => {
    const props = this.controller.run('getDiagramProps');
    this.controller.run("undo", props);
  };

  onClickRedo = e => {
    const props = this.controller.run('getDiagramProps')
    this.controller.run("redo", props);
  };

  getDiagramProps() {
    return this.controller.run("getDiagramProps");
  }

  renderToolbar() {
    const { controller  } = this;
    const diagramProps = this.getDiagramProps();
    const canUndo = controller.run("canUndo", diagramProps);
    const canRedo = controller.run("canRedo", diagramProps);
    const toolbarProps = {
      diagramProps: diagramProps,
      openNewModel: this.openNewModel,
      openDialog: this.openDialog,
      closeDialog: this.closeDialog,
      onClickUndo: this.onClickUndo,
      onClickRedo: this.onClickRedo,
      canUndo,
      canRedo
    };
    return <Toolbar {...toolbarProps} />;
  }

  renderCounter() {
      const nTopics = this.controller.run('getAllTopicCount', { model: this.state.model })
      const buttonProps = {
        style: { height: "40px"},
        disable: "true"
      }
      return <div>
        <Button {...buttonProps}> {nTopics} nodes</Button>
      </div>;
  }

  renderCacheButton() {
      const buttonProps = {
        style: { height: "40px"},
        onClick: () => this.saveCache(() => {alert(`Auto-Save at ${new Date()}`)})
      }
      return <div>
        <Button {...buttonProps}> Save Cache </Button>
      </div>;
  }

  saveCache = (callback=() => {}) => {
      const { controller, state: { model } } = this;
      log(`Auto-Save at ${new Date()}`, { this: this, controller, model })
      if (model) {
          const serializedModel = controller.run('serializeModel', { controller, model });
          localforage.setItem('react-mindmap-evernote-mind', JSON.stringify(serializedModel));
          callback()
      }
  }

  async componentDidMount() {
      log('componentDidMount')
      await localforage.getItem('react-mindmap-evernote-mind', (err, value) => {
        if (err === null && value) {
            const { controller } = this;
            let obj = JSON.parse(value);
            const model = controller.run("deserializeModel", { controller, obj });
            const nTopics = controller.run("getAllTopicCount", { model })
            if (model && nTopics) { 
              this.openDialog({
                isOpen: true,
                children: <>
                  { `Detect previously cached graph containing ${nTopics} topics. Do you want to load your cached graph?` }
                  <Button onClick={() => {
                    this.controller.change(model) // model should be updated by controller
                    this.setState({ loadFromCached: true, initialized: true, dialog: {isOpen: false}}, () => this.startRegularJob()) 
                  }}>Yes</Button>
                  <Button onClick={() => this.setState({ initialized: true, dialog: {isOpen: false} }, () => this.startRegularJob()) }>No</Button> 
                </>
              })
              return ;
            }; 
        } else {
          this.setState({ initialized: true }, () => this.startRegularJob());
        }
      })
  }

  startRegularJob () {
    this.autoSaveModel()
    this.updateNotebooks()
    this.updateNotes()
  }

  // autoSave per 60s
  autoSaveModel = () => setInterval(this.saveCache, 60000)

  offset = 500

  // update notes regularly
  updateNotes = () => { 
        setInterval(
            () => {
                const { controller } = this;
                log(`regularly updating notes`)
                let cur = controller.currentModel.getIn(['extData', 'allnotes', 'cur'], 0);
                if (cur > 10000) { cur = 0; }
                getAllNotes(cur, cur + this.offset, false, (xhr) => {
                    log(xhr.responseText); // 请求成功
                    const newNotes = JSON.parse(xhr.responseText)?.['notes'] ?? []; 
                    let newModel = controller.currentModel.updateIn(['extData', 'allnotes', 'notes'], notes => mergeNotes(notes ?? [], newNotes))
                    newModel = newModel.updateIn(['extData', 'allnotes', 'cur'], () => cur + this.offset)
                    controller.change(newModel, () => {
                        log(`regularly updated ${this.offset} notes`)
                    })
                }, (xhr) => {
                    log(`regularly updated 0 note because query failed`)
                })
            }
          , 60000)
   }

  // update notebooks regularly
  updateNotebooks = () => { 
        setInterval(
            () => {
                const { controller } = this;
                log(`regularly updating notebooks`)
                getNotebookList(false, (xhr) => {
                    log(xhr.responseText); // 请求成功
                    const data = JSON.parse(xhr.responseText);
                    let newModel = controller.currentModel.updateIn(['extData', 'allnotes', 'notebooks'], notebooks => new Map(data['notebooks'].map(item => [item.guid, item.name])))
                    controller.change(newModel, () => {})
                    log(`regularly updated ${data['notebooks'].length} notebooks`)
                }, (xhr) => {
                    log(`regularly updated 0 notebooks because query failed`)
                })
            }
          , 60000)
    }


  onLoadFromCached = () => {
    const nTopics = this.controller.run("getAllTopicCount", { model: this.state.model });
    this.openDialog({
      isOpen: true,
      children: <>
        <div className={Classes.DIALOG_BODY}>
        { `Load ${nTopics} topics from cache!` }
        </div>
        <Button onClick={() => this.setState({ loadFromCached: null, dialog: {isOpen: false} }) }>OK</Button> 
      </>
    })
  }

  // debug
  componentDidUpdate() {
      if (this.state.loadFromCached && !this.state.dialog.isOpen) {
        this.onLoadFromCached();
      }
      const { controller } = this;
      if (controller) {
          log("componentDidUpdate:", { 
            state: this.state, 
            allnotes: getNotesFromModel(this.state.model, []),
            current_allnotes: getNotesFromModel(this.controller.currentModel, [])
          })
          // log((controller.run('getUndoRedoStack')))
          log({ 
              redo: (controller.run('getUndoRedoStack')).redoStack.size, 
              undo: (controller.run('getUndoRedoStack')).undoStack.size
        })
      }
  }

  onChange = (model, callback) => {
    this.setState({ model }, callback);
  };

  render() {
    return <div> {
          <div className="mindmap" style={{visibility: this.state.initialized ? 'visible' : 'hidden'}}>
            <Dialog { ...this.state.dialog }></Dialog>
            { this.getDiagramProps() && this.renderToolbar()}
            { this.controller.run('renderDiagram', { model: this.state.model, controller: this.controller }) }
            <div className="bm-left-bottom-conner">
              { this.renderCounter() }
              { this.renderCacheButton() }
            </div>
          </div> 
      }
      </div>;
  }
}

export default Mindmap;
