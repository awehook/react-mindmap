import { Dialog } from "@blueprintjs/core";
import { nonEmpty } from '../../utils';
import React from "react";

export const getDialog = ({ key, title, content, buttons }) => {
    const dialogProps = {
        key,
        isOpen: true,
        title,
        children: <>
            {nonEmpty(content) && content}
            { buttons }
        </>
    }
    return <Dialog {...dialogProps} />
}
