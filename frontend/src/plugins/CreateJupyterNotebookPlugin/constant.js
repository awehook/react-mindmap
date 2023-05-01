import { getEnv } from '../../utils/index'
import { ClientType } from './jupyter';

export const JUPYTER_BASE_URL = getEnv('REACT_APP_JUPYTER_BASE_URL');
export const JUPYTER_ROOT_FOLDER = getEnv('REACT_APP_JUPYTER_ROOT_FOLDER')
export const JUPYTER_CLIENT_TYPE = ClientType.fromString(getEnv('REACT_APP_JUPYTER_CLIENT_TYPE'))
export const JUPYTER_CLIENT_ENDPOINT = getEnv('REACT_APP_JUPYTER_CLIENT_ENDPOINT')