''' FLASK WEB SERVER '''

from flask import Flask
from flask import render_template

from utils.logger import get_logger
log = get_logger('__name__', fpath='backend/logs/httpserver_logs.txt')

app = Flask(__name__)
app.secret_key = 'big_secret'

@app.route('/')
def homepage():
    print "hello world"
    #Single page app
    return render_template("routehandler.html")

@app.route('/<path:path>')
def handle_content(path):
    print "Site entry from %s" % path
    return render_template("routehandler.html")

@app.route('/simpletest')
def show_simpletest():
    return render_template('simple_test.html')

if __name__ == '__main__':
    app.run(debug=True)
