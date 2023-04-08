import pymysql
from typing import Optional
from pymysql.cursors import DictCursor
from datetime import datetime
from app.databases.connection import DbConnection

class MysqlConnection(DbConnection):

    def __init__(self, config: dict) -> None:
        self.connectionConfig = {}
        self.otherParams = {}
        connectionConfigKeys = { "host", "user", "password", "database", "charset", "port" }
        for k, v in config.items():
            if k in connectionConfigKeys: 
                self.connectionConfig[k] = v
            else:
                self.otherParams[k] = v
        self.connection = pymysql.connect(**self.connectionConfig)

    def pull(self) -> Optional[dict]:
        with self.connection.cursor(DictCursor) as cursor:
            sql = f"SELECT * FROM {self.otherParams['tableName']} ORDER BY time DESC LIMIT 1"
            cursor.execute(sql)
            data = cursor.fetchone()
        return data

    def push(self, jsonStr: str) -> None:
        sql = f"INSERT INTO {self.otherParams['tableName']}(time, json) VALUES(%s, %s)"
        with self.connection.cursor() as cursor:
            cursor.executemany(sql, [(datetime.now(), jsonStr)])
            self.connection.commit()
