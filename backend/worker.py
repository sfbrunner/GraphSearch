''' worker.py '''

import sys

sys.path.append('lib')
from lib.GraphSession import GraphSession
from celery import Celery
from celery.utils.log import get_task_logger
import traceback
import json

from utils.logger import LogHandler
from utils.logger import get_logger
#log = get_logger('__name__', fpath='backend/logs/worker_logs.txt')

if __name__ == '__main__':
    print 'This is main'
    log = get_task_logger(__name__)
    log = LogHandler.format_logger(log, fpath='backend/logs/worker_logs.txt')
    log.info('This is a new logger.')
else:
    log = get_logger()
    log.info('This is coming from the old logger.')

log.info('Worker logging active.')

app = Celery(__name__, backend='rpc://', broker='redis://localhost:6379/')

# redis-server
# $ celery -A worker worker --loglevel=debug -P solo

@app.task
def getGraph(*args, **kwargs):
    '''returns the graph json in cytoscape format'''
    try:
        log.info(*args)
        graphSession = GraphSession(*args, **kwargs)
        graphJSON = json.loads(graphSession.get_cy_json_mongo(graph_format=kwargs['graph_format'], mode=kwargs['mode']))
        log.info('Logging in getGraph of worker')
        return graphJSON
    except Exception as e:
        traceback_str = traceback.format_exc()
        log.error(traceback_str)
        return graphSession.return_empty_graph()
