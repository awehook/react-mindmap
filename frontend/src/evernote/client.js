export default class EvernoteClientProxy {

    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    request(method, params) {
        var xhr = new XMLHttpRequest();
        const url = `${this.endpoint}/${method}`;
        xhr.open("post", url, false);
        const paramString = new URLSearchParams(params).toString();
        console.log({ params, paramString })
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(paramString);
        let res;
        if (xhr.readyState === 4){
            if((xhr.status>=200 && xhr.status<300) || xhr.status === 304){
                console.log(xhr.responseText); // 请求成功
                res = JSON.parse(xhr.responseText);
            } else {
                res = {error: 'Request was unsuccessful:' + xhr.status}
            }
        }
        console.log(xhr)
        return res;
    }

    asyncRequest(method, params, successCallback, failCallback) {
        var xhr = new XMLHttpRequest();
        const url = `${this.endpoint}/${method}`;
        try {
            xhr.open("post", url);
        } catch (e) {
            console.error(e);
            return ;
        }
        const paramString = new URLSearchParams(params).toString();
        console.log({ params, paramString })
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4){
                if((xhr.status>=200 && xhr.status<300) || xhr.status === 304){
                   successCallback && successCallback(xhr)
                } else {
                    failCallback && failCallback(xhr)
                }
            }
        }
        xhr.send(paramString);
        console.log(xhr)
    }

    getAllNoteList(params, sync=true, successCallback=null, failCallback=null) {
        return sync ? this.request('findNotes', params): this.asyncRequest('findNotes', params, successCallback, failCallback);
    }

    getNotebookList(params, sync=true, successCallback=null, failCallback=null) {
        return sync ? this.request('getNotebooks', params): this.asyncRequest('getNotebooks', params, successCallback, failCallback);
    }

    getNote(guid) {
        return this.request('getNote', { guid })
    }

}