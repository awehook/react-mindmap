from reactmindmap.connections.config import CONFIG
from reactmindmap.databases.connection import IDbConnection

class DbConnectionFactory:

    @classmethod
    def getDbConnectionFactory(self, dbConnectionName: str) -> IDbConnection:
        if dbConnectionName not in CONFIG:
            raise Exception(f"Not a valid connection name: {dbConnectionName}")
        db = CONFIG[dbConnectionName]
        dbConnection = db['connectionClass'](db['connectionConfig'])
        return dbConnection
        