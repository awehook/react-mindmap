from flask import request
from typing import cast
from app.config import app
from app.connections.factory import DbConnectionFactory
from app.utils.type_utils import nn

@app.route('/api/db/<dbconnectionName>/pull')
def pull(dbconnectionName: str):
    try:
        connection = DbConnectionFactory.GetDbConnectionFactory(dbconnectionName)
        json = connection.pull()
    except Exception as e:
        return { "error": "Error while operationing on database", 
                 "message": f"Not finished due to {e}" }, 403
    return { 'data': json }, 200

@app.route('/api/db/<dbconnectionName>/push', methods=['POST'])
def push(dbconnectionName: str):
    try:
        connection = DbConnectionFactory.GetDbConnectionFactory(dbconnectionName)
        jsonData = request.json
        if 'json' not in nn(jsonData):
            return {
                "error": "Miss parameter", 
                "message": "Please pass a json parameter {e}" 
            }, 403
        json = cast(dict, jsonData).get('json')
        connection.push(json)
    except Exception as e:
        return { "error": f"Not finished due to ", "message": e }, 403
    return { "message": "Insertion finished" }, 200