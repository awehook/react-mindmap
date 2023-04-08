from flask import Flask
from flask_inflate import Inflate
from flask_compress import Compress
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
Compress(app)
Inflate(app)
