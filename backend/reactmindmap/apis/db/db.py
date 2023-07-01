from dataclasses import asdict

from flask import request
from reactmindmap.app import app
from reactmindmap.connections.factory import DbConnectionFactory
from reactmindmap.databases.model.graph import PartialDataRow


@app.route("/api/db/<dbconnectionName>/pull")
def pull(dbconnectionName: str):
    try:
        connection = DbConnectionFactory.getDbConnectionFactory(dbconnectionName)
        data = connection.pull()
    except Exception as e:
        return {
            "error": "Error while operationing on database",
            "message": f"Not finished due to error: {e}",
        }, 403
    if data is None:
        return {"data": None}, 200
    return {"data": asdict(data)}, 200


@app.route("/api/db/<dbconnectionName>/push", methods=["POST"])
def push(dbconnectionName: str):
    try:
        connection = DbConnectionFactory.getDbConnectionFactory(dbconnectionName)
        jsonData = request.json
        if jsonData is None:
            return {
                "error": "Malformed json body",
                "message": f"Malformed json body: {jsonData}",
            }, 403
        try:
            data = PartialDataRow(**jsonData)
        except Exception as e:
            app.logger.error("Running into an error", exc_info=True)
            return {
                "error": "Malformed data",
                "message": f"Please pass a json parameter: {jsonData}",
            }, 403
        connection.push(**asdict(data))
    except Exception as e:
        app.logger.error("Running into an error", exc_info=True)
        return {
            "error": "Can't push to database",
            "message": f"Not finished due to message: {e}",
        }, 403
    return {"message": "Insertion finished"}, 200
