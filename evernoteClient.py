import flask
from flask import Flask, request
from evernote.api.client import EvernoteClient
from evernote.edam.notestore import NoteStore

developer_token = "<your_token>"
# Set up the NoteStore client
client = EvernoteClient(token=developer_token, china=True ,sandbox=False)
notestore = client.get_note_store()
app = Flask(__name__)


@app.route('/test')
def test():
    return "hello! this is test"

@app.route('/getNote', methods=['GET', 'POST'])
def getNote():
    guid = request.form.get('guid')
    if guid is None:
        return flask.jsonify({'error': "Must provide a valid guid"}), 400
    withContent= request.form.get('withContent', True)
    withResourcesData = request.form.get('withResourcesData', False)
    note = notestore.getNote(guid, withContent, withResourcesData, False, False)
    print(note)
    response = flask.jsonify({
        'note': {
            'title': note.title,
            'content': note.content
        }
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/findNotes', methods=['GET', 'POST'])
def findNotes():
    print(request.form)
    note_filter = NoteStore.NoteFilter()
    if request.form.get('filter_order', None):
        note_filter.order = int(request.form.get('filter_order'))
        note_filter.ascending = 0
    print(note_filter)
    notes = notestore.findNotes(note_filter, 
                                int(request.form.get('start', '0')), 
                                int(request.form.get('offset', '10'))).notes
    res = []
    for note in notes:
        res.append({'guid': note.guid, 'title': note.title})
    response = flask.jsonify({'notes': res})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5001, threaded=True)
