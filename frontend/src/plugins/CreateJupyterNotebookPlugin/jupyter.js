import axios from 'axios';
import { ensureSuffix } from './utils';
import { log } from './logger';
import { trimWordStart, trimWordEnd } from './stringUtils';

const _getAbsolutePath = (rootPath) => (path) => {
        return trimWordEnd(rootPath, '/') + '/' + trimWordStart(path, '/');
    }

export class NotFoundError extends Error
{
}

export class ClientType {
    static JupyterLab = new ClientType("JupyterLab")
    static JupyterNotebook = new ClientType("JupyterNotebook")

    constructor(name)
    {
        this.name = name;
    }

    static fromString(name)
    {
        const hashMap = new Map(Object.entries(ClientType))
        if (!hashMap.has(name))
            throw new NotFoundError(`Not a valid enum name: ${name}`);
        return hashMap.get(name);
    }
}

export class JupyterClient 
{
    constructor(base_url, { jupyterBaseUrl, rootFolder, clientType }) 
    {
        this.base_url = base_url;
        this.rootFolder = rootFolder;
        this.jupyterBaseUrl = jupyterBaseUrl
        this.clientType = clientType
        this.instance = axios.create({
            baseURL: base_url
        })
        this.getAbsolutePath = _getAbsolutePath(this.rootFolder)
    }

    async createNote(path, noteTitle)
    {
        const uri = `/api/jupyter/create_notebook`;
        // Send a GET request (default method)
        let response;

        const payload = {
            path: this.getAbsolutePath(ensureSuffix(path, ".ipynb")),
            note_title: noteTitle,
            parents: true
        }
        log({ payload })
        response = await this.instance.post(uri,
            payload
        );
        console.log(response)
        return response;
    }

    getActualUrl(path)
    {
        if (this.clientType === ClientType.JupyterLab)
        {
            return trimWordEnd(this.jupyterBaseUrl, '/') + '/lab/tree/' + trimWordStart(this.getAbsolutePath(path), '/')
        }
        else
        {
            return trimWordEnd(this.jupyterBaseUrl, '/') + '/' + trimWordStart(this.getAbsolutePath(path), '/')
        }
    }
}
