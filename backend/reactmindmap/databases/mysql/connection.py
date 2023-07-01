import hashlib
from datetime import datetime
from typing import Optional

import pymysql
from pymysql.cursors import DictCursor
from reactmindmap.databases.connection import IDbConnection
from reactmindmap.databases.model.graph import DataRow


# generate a md5 hash function
def md5(s: str) -> str:
    block = hashlib.md5()
    block.update(s.encode("utf-8"))
    return block.hexdigest()


class MysqlConnection(IDbConnection):
    def __init__(self, config: dict) -> None:
        self.connectionConfig = {}
        self.otherParams = {}
        connectionConfigKeys = {
            "host",
            "user",
            "password",
            "database",
            "charset",
            "port",
        }
        for k, v in config.items():
            if k in connectionConfigKeys:
                self.connectionConfig[k] = v
            else:
                self.otherParams[k] = v
        self.connection = pymysql.connect(**self.connectionConfig)

    def pull(self) -> Optional[DataRow]:
        with self.connection.cursor(DictCursor) as cursor:
            sql = f"SELECT * FROM {self.otherParams['tableName']} ORDER BY time DESC LIMIT 1"
            cursor.execute(sql)
            row = cursor.fetchone()
            if row is None:
                return None
        row['jsonStr'] = row.pop('json')
        return DataRow(**row)

    def push(self, jsonStr: str, timestamp: Optional[datetime]=None, version: Optional[str]=None, parentVersion: Optional[str]=None) -> None:
        timestamp = timestamp or datetime.now()
        version = version or md5(jsonStr)
        sql = f"INSERT INTO {self.otherParams['tableName']}(time, json, version, parentVersion) VALUES(%s, %s, %s, %s)"
        with self.connection.cursor() as cursor:
            cursor.executemany(sql, [(timestamp, jsonStr, version, parentVersion)])
            self.connection.commit()