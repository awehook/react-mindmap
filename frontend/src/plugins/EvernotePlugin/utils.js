import React from 'react';
import { Map as ImmutableMap } from "immutable";
import { nonEmpty } from '../../utils';

export const getEvernoteIcon = (props) => {
    const { controller } = props;
    return <div onClick={() => controller.run("operation", { ...props, opType: "OPEN_EVERNOTE_LINK" })}>
        <img key="image1"
            src="data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2220px%22%20height%3D%2220px%22%20viewBox%3D%220%200%2020%2020%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cg%20id%3D%22Mac_Note_Normal_1%22%20stroke%3D%22none%22%20stroke-width%3D%221%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0A%20%20%20%20%20%20%20%20%3Cg%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpolygon%20id%3D%22footprint%22%20fill-opacity%3D%220%22%20fill%3D%22%23FFCF57%22%20points%3D%220%200%2020%200%2020%2020%200%2020%22%3E%3C%2Fpolygon%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20id%3D%22Web_Note_16%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cpolygon%20id%3D%22footprint%22%20fill-opacity%3D%220%22%20fill%3D%22%23FFCF57%22%20points%3D%222%202%2018%202%2018%2018%202%2018%22%3E%3C%2Fpolygon%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M12.7272727%2C17%20L6.18181818%2C17%20C4.97636364%2C17%204%2C16.105%204%2C15%20L4%2C5%20C4%2C3.895%204.97636364%2C3%206.18181818%2C3%20L13.8181818%2C3%20C15.0236364%2C3%2016%2C3.895%2016%2C5%20L16%2C14%20L12.7272727%2C17%20L12.7272727%2C17%20Z%20M13%2C15.543%20L14.543%2C14%20L13%2C14%20L13%2C15.543%20L13%2C15.543%20Z%20M6.11111111%2C4%20C5.49777778%2C4%205%2C4.448%205%2C5%20L5%2C15%20C5%2C15.552%205.49777778%2C16%206.11111111%2C16%20L11.9955114%2C16%20L11.9955114%2C13%20L15%2C13%20L15%2C5%20C15%2C4.448%2014.5022222%2C4%2013.8888889%2C4%20L6.11111111%2C4%20Z%20M7%2C9%20L13%2C9%20L13%2C10%20L7%2C10%20L7%2C9%20L7%2C9%20Z%20M7%2C6%20L13%2C6%20L13%2C7%20L7%2C7%20L7%2C6%20L7%2C6%20Z%20M10%2C13%20L7%2C13%20L7%2C12%20L10%2C12%20L10%2C13%20L10%2C13%20Z%22%20id%3D%22icon%22%20fill%3D%22%23424242%22%3E%3C%2Fpath%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E"
            alt=""
            width="20"
            height="20"
        />
    </div>
}

export const hasEvernoteAttached = ({ topicKey, model }) => {
    if (!nonEmpty(topicKey))
        topicKey = model.focusKey;
    const evernoteData = model.getIn(
        ['extData', 'evernote'],
        new ImmutableMap()
    );
    return evernoteData.get(topicKey) !== undefined;
}