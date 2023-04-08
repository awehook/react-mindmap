import os
import flask
import functools
from flask import request
from evernote.api.client import EvernoteClient
from evernote.edam.notestore import NoteStore
from typing import Optional
from app.config import app

def initializeClient() -> Optional[EvernoteClient]:
    evernote_token = os.environ.get('EVERNOTE_TOKEN', None)
    if evernote_token is None:
        return None
    client = EvernoteClient(token=evernote_token, china=True ,sandbox=False)
    return client

def str2bool(s: str) -> bool:
    if s.upper() in ['F', 'FALSE', '0']:
        return False
    return True

def extractNote(note):
    return {
        'guid': note.guid,
        'title': note.title,
        'content': note.content,
        'updated': note.updated,
        'deleted': note.deleted,
        'notebookGuid': note.notebookGuid,
    }

def extractNotebook(notebook):
    return {
        'name': notebook.name,
        'guid': notebook.guid,
    }

def helper(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        app.logger.debug("request.form: %s", request.form)
        ret = func(*args, **kwargs)
        response, status_code = ret
        app.logger.debug("response.get_data(): %s", response.get_data())
        return (response, status_code)
    return wrapper

@app.route('/api/evernote/getNotebooks', methods=['GET', 'POST'])
@helper
def getNotebooks():
    client = initializeClient()
    if client is None:
        return flask.jsonify({ 
            'message': 'EVERNOTE_TOKEN is not set, please set EVERNOTE_TOKEN' 
        }), 400
    notestore = client.get_note_store()
    try:
        notebookList = notestore.listNotebooks()
    except Exception as e:
        app.logger.error(e)
        return flask.jsonify({
                'error': 'Failed to get notebooks',
                }), 400
    return flask.jsonify({
        'notebooks': [extractNotebook(nb) for nb in notebookList]
    }), 200


@app.route('/api/evernote/getNote', methods=['GET', 'POST'])
@helper
def getNote():
    client = initializeClient()
    if client is None:
        return flask.jsonify({ 
            'message': 'EVERNOTE_TOKEN is not set, please set EVERNOTE_TOKEN' 
        }), 400
    notestore = client.get_note_store()
    guid = request.form.get('guid')
    if guid is None:
        return flask.jsonify({'error': "Must provide a valid guid"}), 400
    withContent= request.form.get('withContent', True)
    withResourcesData = request.form.get('withResourcesData', False)
    try:
        note = notestore.getNote(guid, withContent, withResourcesData, False, False)
    except Exception as e:
        app.logger.error(e)
        return flask.jsonify({
            'message': 'GetNote Error'
        }), 400
    return flask.jsonify({
                'note':  extractNote(note)   
            }), 200

@app.route('/api/evernote/findNotes', methods=['POST'])
@helper
def findNotes():
    client = initializeClient()
    if client is None:
        return flask.jsonify({ 
            'message': 'EVERNOTE_TOKEN is not set, please set EVERNOTE_TOKEN' 
        })
    notestore = client.get_note_store()
    note_filter = NoteStore.NoteFilter()
    note_filter.inactive = str2bool(request.form.get('inactive', 'FALSE'))
    if request.form.get('filter_order', None):
        note_filter.order = int(request.form.get('filter_order'))
        note_filter.ascending = 0
    start = int(request.form.get('start', '0'))
    offset =  int(request.form.get('offset', '10'))
    try:
        notes = notestore.findNotes(note_filter, start, offset).notes
    except Exception as e:
        app.logger.error(e)
        return flask.jsonify({ 
            'error': "Failed to find notes"
        }), 400
    return flask.jsonify({
        'notes': [extractNote(note) for note in notes]
        }), 200