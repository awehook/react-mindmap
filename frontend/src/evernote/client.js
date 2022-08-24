export default class EvernoteClientProxy {

    constructor(host='localhost', port=5001) {
        this.host = host
        this.port = port
    }

    request(method, params) {
        var xhr = new XMLHttpRequest();
        const url = `http://${this.host}:${this.port}/${method}`;
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

    asyncRequest(method, params, callback) {
        var xhr = new XMLHttpRequest();
        const url = `http://${this.host}:${this.port}/${method}`;
        xhr.open("post", url);
        const paramString = new URLSearchParams(params).toString();
        console.log({ params, paramString })
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4){
                if((xhr.status>=200 && xhr.status<300) || xhr.status === 304){
                    callback(xhr)
                } else {
                    console.log({error: 'Request was unsuccessful:' + xhr.status})
                }
            }
        }
        xhr.send(paramString);
        console.log(xhr)
    }

    getAllNoteList(params, sync=true, callback) {
        return sync ? this.request('findNotes', params): this.asyncRequest('findNotes', params, callback);
    }

    getNote(guid) {
        return this.request('getNote', { guid })
    }

}