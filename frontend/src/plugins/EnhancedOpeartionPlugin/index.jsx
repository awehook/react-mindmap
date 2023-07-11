import { OpType } from "@blink-mind/core";

export function EnhancedOperationPlugin() {
    return {
        getAllowUndo(props, next) {
            const { allowUndo } = props;
            if (allowUndo !== undefined && allowUndo !== null) {
                return allowUndo;
            }
            return next();
        },
    }
}