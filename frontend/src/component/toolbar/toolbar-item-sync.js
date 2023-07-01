// @ts-check
import { Button, Menu, MenuItem, Popover } from "@blueprintjs/core";
import cx from "classnames";
import React from "react";
import { DbConnectionFactory } from "../../db/db";
import { iconClassName } from "../../icon";

export function ToolbarItemSync(props) {

  const dbConnection = DbConnectionFactory.getDbConnection();

  const onClickPull = e => {
    const { diagramProps, openNewModel, openDialog, closeDialog } = props;
    const { controller } = diagramProps;
    dbConnection.pull().then(
      (jsonBody) => {
        const obj = JSON.parse(jsonBody.data.jsonStr)
        const timestamp = jsonBody.data.time;
        const model = controller.run("deserializeModel", { controller, obj });
        openDialog({
          isOpen: true,
          children: <>
            {`Do you want to pull data from cloud\n(${model.topics.count()}, ${timestamp}) ?`}
            <Button onClick={() => {
              closeDialog()
              openNewModel(model)
            }}>Yes</Button>
            <Button onClick={() => closeDialog()}>No</Button>
          </>,
          intent: "primary",
          minimal: true
        })
      }
    ).catch(e => { console.error(e) });
  }

  const onClickPush = e => {
    const { diagramProps, openDialog, closeDialog } = props;
    const { controller } = diagramProps;

    const onClickYes = () => {
      const model = controller.currentModel;
      const json = controller.run("serializeModel", { ...diagramProps, model },);
      const jsonStr = JSON.stringify(json);

      const version = controller.run('getVersion', { controller, model })
      const workingTreeVersion = controller.run('getWorkingTreeVersion', { controller, model: controller.currentModel });
      dbConnection.push(jsonStr, version, workingTreeVersion).then(
        (result) => {
          controller.run('operation', { controller, model, opType: 'moveVersionForward' });
          openDialog({
            isOpen: true,
            children: <>
              {`Pushed finished!`}
              <Button onClick={() => closeDialog()}> Confirm </Button>
            </>,
            intent: "primary",
            minimal: true
          })
        }
      ).catch(e => {
        console.error(e);
        openDialog({
          isOpen: true,
          children: <>
            {`Pushed failed! Error Code: ${e}`}
            <Button onClick={() => closeDialog()}> Confirm </Button>
          </>,
          intent: "primary",
          minimal: true
        })
      }
      );
    }

    const onClickNo = () => closeDialog()

    openDialog({
      isOpen: true,
      children: <>
        {`Do you want to push data to the cloud (${controller.currentModel.topics.count()}) ?`}
        <Button onClick={onClickYes}>Yes</Button>
        <Button onClick={onClickNo}>No</Button>
      </>,
      intent: "primary",
      minimal: true
    })
  }

  return (
    <div className={cx("bm-toolbar-item", iconClassName("loop2"))}>
      <Popover enforceFocus={false}>
        <div className="bm-toolbar-popover-target" />
        <Menu>
          <MenuItem text="Pull" onClick={onClickPull} />
          <MenuItem text="Push" onClick={onClickPush} />
        </Menu>
      </Popover>
    </div>
  );
}
