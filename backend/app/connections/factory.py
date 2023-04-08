from app.connections.config import CONFIG
from app.databases.connection import DbConnection

class DbConnectionFactory:

    @classmethod
    def GetDbConnectionFactory(self, dbConnectionName: str) -> DbConnection:
        if dbConnectionName not in CONFIG:
            raise Exception(f"Not a valid connection name: {dbConnectionName}")
        db = CONFIG[dbConnectionName]
        dbConnection = db['connectionClass'](db['connectionConfig'])
        return dbConnection
        