// @ts-check
import { gzip } from 'pako';
import { getEnv } from '../utils';
import { md5 } from '../utils/md5';

export default class DBConnection {
  constructor(dbConnectionName, endpoint) {
    this.dbConnectionName = dbConnectionName;
    this.endpoint = endpoint
  }

  async pull() {
    const url = `${this.endpoint}/db/${this.dbConnectionName}/pull`
    const response = await fetch(url, {
      method: 'GET', // or 'PUT'
    })
    const res = await response.json();
    return res;
  }

  /**
   * Sends a compressed JSON string to the server to update the database.
   *
   * @param {string} jsonStr - The JSON string to be compressed and sent.
   * @param {string|null} parentVersion - The previous version of the document that the new version is based on, if any.
   * @param {string|null} version - The version identifier for the new document. If null, it will be calculated as the MD5 hash of the JSON string.
   * @return {Promise<object>} A Promise that resolves with the parsed JSON response from the server.
   */
  async push(jsonStr, parentVersion = null, version = null) {
    const url = `${this.endpoint}/db/${this.dbConnectionName}/push`;
    const data = {
      jsonStr,
      version,
      parentVersion
    };
    const payload = gzip(JSON.stringify(data));
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

export class DbConnectionFactory {
  static getDbConnection() {
    const connection = new DBConnection(
      getEnv('REACT_APP_DB_CONNECTION_NAME', 'mysql'),
      getEnv('REACT_APP_DB_ENDPOINT', 'http://localhost:5000')
    )
    return connection;
  }
}