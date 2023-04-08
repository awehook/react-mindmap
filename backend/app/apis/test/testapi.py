import flask
from app.config import app

@app.route('/api/test')
def test():
    return flask.jsonify({ "message": "hello! this is test" }), 200