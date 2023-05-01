from reactmindmap.jupyter.jupyter_client import JupyterClient
from retrying import retry
from flask import request, jsonify
from reactmindmap.apis.jupyter.template import get_template
from reactmindmap.app import app
from reactmindmap.constants import JUPYTER_BASE_URL, JUPYTER_PASSWORD

jupyter_client = JupyterClient(JUPYTER_BASE_URL, JUPYTER_PASSWORD)

@app.route('/api/jupyter/create_directory', methods=["POST"])
def create_directory():
    app.logger.debug(request.get_json())
    path = request.get_json()["path"]
    recursive = request.get_json().get("recursive", False)
    try:
        if recursive:
            jupyter_client.create_directory_recursive(path)
        else:
            jupyter_client.create_directory(path)
    except Exception as e:
        return jsonify({'message': 'Create failed!', 'error': str(e) }), 400
    else:
        return jsonify({'message': 'Create succeeded!'}), 200

def get_parent_path(path) -> str:
    splitted = path.strip().split('/')[:-1]
    if len(splitted) == 0:
        return "/"
    else:
        return "/".join(splitted)

@app.route("/api/jupyter/create_notebook", methods=["POST"])
def create_notebook():
    app.logger.debug(request.get_json())
    path = request.get_json()["path"]
    template_name = request.get_json().get("template_name", "basic")
    note_title = request.get_json().get("note_title", "Untitled")
    parents = request.get_json().get("parents", False)
    interpolated = get_template({"note_title": note_title}, template_name)
    try:
        if parents:
            parent_path = get_parent_path(path)
            retry(stop_max_attempt_number=3)(jupyter_client.create_directory_recursive)(parent_path)
        jupyter_client.create_notebook(path, interpolated)
    except Exception as e:
        return jsonify({'message': 'Create failed!'}), 400
    else:
        return jsonify({'message': 'Create succeeded!'}), 200