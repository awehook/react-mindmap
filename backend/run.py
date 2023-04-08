from app.config import app
from app.apis import *

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True, port=5001, threaded=True)