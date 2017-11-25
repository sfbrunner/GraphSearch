''' FLASK WEB SERVER '''

import sys

from flask import Flask
from flask import render_template
from flask import jsonify
from flask import request

app = Flask(__name__)
app.secret_key = 'big_secret'

@app.route('/')
def homepage():
    print "hello world"
    '''Single page app'''
    return render_template("mainReact.html")

if __name__ == '__main__':
    app.run(debug=True)
