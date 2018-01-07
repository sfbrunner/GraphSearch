''' FLASK RESTAPI SERVER '''

from flask import Flask
from flask import jsonify
from flask import request

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
    task = TASKS[task_id]
    if task.ready():
        response['result'] = task.get()
    return jsonify(response)

@app.route('/api/', methods=['PUT'])
def put_task():
    '''calls worker and returns task id'''
    search_string = request.json['search_string']
    task_id = len(TASKS)
    TASKS[task_id] = getGraph.delay(search_string)
    response = {'result': task_id}
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
