import { gzip } from 'pako'
export default class DBConnection 
{
    constructor(dbConnectionName, endpoint)
    {
        this.dbConnectionName = dbConnectionName;
        this.endpoint = endpoint
    }

    async pull()
    {
        const url = `${this.endpoint}/db/${this.dbConnectionName}/pull`
        const response = await fetch(url, {
          method: 'GET', // or 'PUT'
        })
        return await response.json();
    }

    async push(jsonStr)
    {
        const url = `${this.endpoint}/db/${this.dbConnectionName}/push`
        const payload = gzip(JSON.stringify({ json: jsonStr }));
        const response = await fetch(url, {
          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip',
          },
          body: payload
        })
        return await response.json();
    }
}