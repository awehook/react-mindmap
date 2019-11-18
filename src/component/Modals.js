import React from "react";
import { Dialog, Menu, MenuItem, MenuDivider } from "@blueprintjs/core";

class Modals extends React.PureComponent {

  handleDialogClose = e => {
    this.setState({
      showDialog: false
    });
  };

  render() {
    return (
      <Dialog
        onClose={this.handleDialogClose}
        isOpen={this.state.showDialog}
        autoFocus
        enforceFocus
        usePortal
        title="Please select export file format"
      >
        <Menu>
          <MenuItem text="JSON(.json)" onClick={this.onClickExportJson} />
          <MenuDivider />
        </Menu>
      </Dialog>
    );
  }
}
