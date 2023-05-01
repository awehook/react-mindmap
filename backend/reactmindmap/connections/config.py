from reactmindmap.databases.mysql.connection import MysqlConnection

CONFIG  = {
    "mysql": {
        "connectionClass": MysqlConnection,
        "connectionConfig": {
            "host":"mysql",
            "port": 3306,
            "user": "root",
            "password": "12345",
            "database": "react_mindmap",
            "charset": "utf8",
            "tableName": "mindmap"
        }
    }
}