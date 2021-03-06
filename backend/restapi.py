''' FLASK RESTAPI SERVER '''

from flask import Flask
from flask import jsonify
from flask import request

from utils.logger import get_logger
log = get_logger(__name__, fpath='logs/restapi_logs.txt')

from worker import getGraph

from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

app.secret_key = 'big_secret'
TASKS = {}

@app.route('/api/', methods=['GET'])
def list_tasks():
    '''returns all current tasks'''
    tasks = {task_id : {'ready': task.ready()}
             for task_id, task in TASKS.items()}
    return jsonify(tasks)

@app.route('/api/<int:task_id>', methods=['GET'])
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

@app.route('/api/', methods=['PUT'])
def put_task():
    '''calls worker and returns task id'''
    search_string = request.json['search_string']
    graph_format = request.json['graph_format']
    task_id = len(TASKS)
    #TASKS[task_id] = getGraph.delay(search_string, graph_format=graph_format, mode='demo')
    TASKS[task_id] = getGraph.delay(search_string, graph_format=graph_format, mode='live')
    response = {'result': task_id}
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8091)
    #app.run()
