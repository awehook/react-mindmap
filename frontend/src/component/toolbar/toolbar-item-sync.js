import cx from "classnames";
import { iconClassName } from "../../icon";
import { Menu, MenuItem, Popover } from "@blueprintjs/core";
import React from "react";
import DbConnection from "../../db/db"
import { Button } from "@blueprintjs/core";
import { getEnv } from "../../utils";

export function ToolbarItemSync(props) {

  const dbConnection = new DbConnection(
      getEnv('REACT_APP_DB_CONNECTION_NAME', 'mysql'),
      getEnv('REACT_APP_DB_ENDPOINT', 'http://localhost:5000')
  )

  const onClickPull = e => {
    const { diagramProps, openNewModel, openDialog, closeDialog } = props;
    const { controller } = diagramProps;
    dbConnection.pull().then(
      (jsonBody) => {
        const obj = JSON.parse(jsonBody.data.json)
        const timestamp = jsonBody.data.time;
        const model = controller.run("deserializeModel", { controller, obj });
        openDialog({
            isOpen: true,
            children: <>
                  { `Do you want to pull data from cloud\n(${model.topics.count()}, ${timestamp}) ?` }
                  <Button onClick={() => {
                      closeDialog()
                      openNewModel(model)
                  }}>Yes</Button>
                  <Button onClick={ () => closeDialog() }>No</Button> 
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
      const json = controller.run("serializeModel", { ...diagramProps, model: controller.currentModel }, );
      const jsonStr = JSON.stringify(json);
      dbConnection.push(jsonStr).then(
        (result) => {
          openDialog({
              isOpen: true,
              children: <>
                    { `Pushed finished!` }
                      <Button onClick={ () => closeDialog() }> Confirm </Button> 
                    </>,
                intent: "primary",
                minimal:true
            })
          }
      ).catch( e => { 
          console.error(e); 
          openDialog({
              isOpen: true,
              children: <>
                    { `Pushed failed! Error Code: ${e}` }
                      <Button onClick={ () => closeDialog() }> Confirm </Button> 
                    </>,
                intent: "primary",
                minimal:true
            })
         }
      ); 
    }

    const onClickNo = () => closeDialog()

    openDialog({
        isOpen: true,
        children: <>
              { `Do you want to push data to the cloud (${controller.currentModel.topics.count()}) ?` }
              <Button onClick={ onClickYes }>Yes</Button>
              <Button onClick={ onClickNo }>No</Button> 
            </>,
        intent: "primary",
        minimal:true
    })
  }

  return (
    <div className={cx("bm-toolbar-item", iconClassName("loop2"))}>
      <Popover enforceFocus={false}>
        <div className="bm-toolbar-sync" />
        <Menu>
          <MenuItem text="Pull" onClick={ onClickPull } />
          <MenuItem text="Push" onClick={ onClickPush } />
        </Menu>
      </Popover>
    </div>
  );
}
