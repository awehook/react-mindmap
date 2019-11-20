import React from "react";
import { Diagram } from "@blink-mind/renderer-react";
import RichTextEditorPlugin from "@blink-mind/plugin-rich-text-editor";
import { JsonSerializerPlugin } from "@blink-mind/plugin-json-serializer";
import { ThemeSelectorPlugin } from "@blink-mind/plugin-theme-selector";
import { Toolbar } from "./Toolbar";
import { downloadFile, generateSimpleModel } from "../utils";
import "@blink-mind/renderer-react/lib/main.css";
import debug from "debug";
const log = debug("app");

const plugins = [
  RichTextEditorPlugin(),
  JsonSerializerPlugin(),
  ThemeSelectorPlugin()
];

export class MindMap extends React.Component {
  constructor(props) {
    super(props);
    this.initModel();
  }

  diagram;
  diagramRef = ref => {
    this.diagram = ref;
    this.setState({});
  };

  initModel() {
    const model = generateSimpleModel();
    this.state = { model };
  }

  onClickOpenFile = e => {
    const input = document.createElement("input");
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    input.type = "file";
    input.accept = ".json";
    log("add onchange");
    input.addEventListener("change", evt => {
      const file = evt.target.files[0];
      const fr = new FileReader();
      log("add fr onload");
      fr.onload = evt => {
        const txt = evt.target.result;
        let obj = JSON.parse(txt);
        log("OpenFile:", obj);
        let model = controller.run("deserializeModel", { controller, obj });
        log("OpenFile:", model);
        this.setState({ model });
      };
      fr.readAsText(file);
    });
    input.click();
  };

  onClickExportJson = e => {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;

    const json = controller.run("serializeModel", props);
    const jsonStr = JSON.stringify(json);
    const url = `data:text/plain,${encodeURIComponent(jsonStr)}`;
    downloadFile(url, "example.json");
    this.setState({ showDialog: false });
  };

  onClickSetTheme = themeKey => e => {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    controller.run("setTheme", { ...props, themeKey });
  };

  onClickSetLayout = layoutDir => e => {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    controller.run("setLayoutDir", { ...props, layoutDir });
  };

  onClickUndo = e => {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    controller.run("undo", props);
  };

  onClickRedo = e => {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    controller.run("redo", props);
  };

  renderDiagram() {
    return (
      <Diagram
        ref={this.diagramRef}
        model={this.state.model}
        onChange={this.onChange}
        plugins={plugins}
      />
    );
  }

  renderToolbar() {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    const canUndo = controller.run("canUndo", props);
    const canRedo = controller.run("canRedo", props);
    const toolbarProps = {
      onClickExportJson: this.onClickExportJson,
      onClickOpenFile: this.onClickOpenFile,
      onClickChangeTheme: this.onClickSetTheme,
      onClickSetLayout: this.onClickSetLayout,
      onClickUndo: this.onClickUndo,
      onClickRedo: this.onClickRedo,
      canUndo,
      canRedo
    };
    return <Toolbar {...toolbarProps} />;
  }

  renderDialog() {}

  onChange = model => {
    this.setState({
      model
    });
  };

  render() {
    return (
      <div className="mindmap">
        {this.diagram && this.renderToolbar()}
        {this.renderDiagram()}
      </div>
    );
  }
}

export default MindMap;
