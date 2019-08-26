import React from "react";
import cx from "classnames";

export class ToolbarItem extends React.Component {
  constructor(props) {
    super(props);
  }
  onClick = () => {
    console.log("toolbar item click");
    let { config, diagramState, onChange } = this.props;
    if (config.opType) {
      this.props.op(config.opType, null);
    } else if (config.clickHandler) {
      config.clickHandler(diagramState, onChange);
    }
  };

  render() {
    const { config } = this.props;
    return (
      <span
        className={cx("bm-toolbar-item", "iconfont", `bm-${config.icon}`)}
        onClick={this.onClick}
      />
    );
  }
}
