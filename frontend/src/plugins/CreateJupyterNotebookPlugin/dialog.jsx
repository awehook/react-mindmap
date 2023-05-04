import { Dialog } from "@blueprintjs/core"
import React from "react"

export const getDialog = ({ key, title, buttons }) => {
    const dialogProps = {
        key,
        isOpen: true,
        children: <>
            { title }
            { buttons }
        </>
    }
    return <Dialog {...dialogProps} />
}
