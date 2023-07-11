import { nonEmpty } from "../../utils";
import { v4 as uuidv4 } from 'uuid';

export const ensureSuffix = (path, suffix) => {
    let normalizedSuffix = suffix;
    if (!suffix.startsWith('.'))
        normalizedSuffix = '.' + normalizedSuffix
    if (!path.endsWith(normalizedSuffix))
        return `${path}${normalizedSuffix}`;
    return path;
}

export const hasJupyterNotebookAttached = ({ model, topicKey }) => {
    if (!nonEmpty(topicKey))
        topicKey = model.focusKey;
    const jupyter_notebook_path = model.getIn(['extData', 'jupyter', topicKey, "path"])
    return nonEmpty(jupyter_notebook_path);
}

export const getJupyterNotebookPath = ({ model, topicKey }) => {
    if (!nonEmpty(topicKey))
        topicKey = model.focusKey;
    const jupyter_notebook_path = model.getIn(['extData', 'jupyter', topicKey, "path"])
    return jupyter_notebook_path;
}

export const generateRandomPath = () => {
    const jupyter_notebook_id = uuidv4();
    const jupyter_notebook_path = jupyter_notebook_id + '/' + ensureSuffix(jupyter_notebook_id, ".ipynb");
    return jupyter_notebook_path;
}