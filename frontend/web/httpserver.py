''' FLASK WEB SERVER '''
import sys
sys.path.append('../../backend')

from flask import Flask
from flask import render_template, jsonify, request

from utils.logger import get_logger
log = get_logger('__name__') #, fpath='backend/logs/httpserver_logs.txt')

from worker import getGraph

from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)
app.secret_key = 'big_secret'
TASKS = {}

#@app.route('/singlepage_api')
#def api_call():
#    print "api call"
#    return "api call"

@app.route('/singlepage_api/', methods=['GET'])
def list_tasks():
    '''returns all current tasks'''
    tasks = {task_id : {'ready': task.ready()}
             for task_id, task in TASKS.items()}
    return jsonify(tasks)

@app.route('/singlepage_api/<int:task_id>', methods=['GET'])
def get_task(task_id):
    '''returns the requested task if ready'''
    response = {'task_id': task_id}
    log.info('Logging in get_task of restapi')
    try:
        task = TASKS[task_id]
        if task.ready():
            response['result'] = task.get()
    except KeyError:
        response['result'] = {'stats': {'num_results': 0}}
    finally:
        return jsonify(response)

@app.route('/singlepage_api/', methods=['PUT'])
def put_task():
    '''calls worker and returns task id'''
    search_string = request.json['search_string']
    graph_format = request.json['graph_format']
    task_id = len(TASKS)
    #TASKS[task_id] = getGraph.delay(search_string, graph_format=graph_format, mode='demo')
    TASKS[task_id] = getGraph.delay(search_string, graph_format=graph_format, mode='live')
    response = {'result': task_id}
    return jsonify(response)

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
