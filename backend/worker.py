''' worker.py '''

import sys

sys.path.append('lib')
from lib.GraphSession import GraphSession
from celery import Celery
from celery.utils.log import get_task_logger
import traceback
import json

logger = get_task_logger(__name__)
app = Celery(__name__, backend='rpc://', broker='redis://localhost:6379/')

# redis-server
# $ celery -A worker worker --loglevel=debug -P solo

@app.task
def getGraph(*args, **kwargs):
    '''returns the graph json in cytoscape format'''
    try:
        graphSession = GraphSession(*args, **kwargs)
        graphJSON = json.loads(graphSession.get_cy_json(graph_format=kwargs['graph_format'], mode=kwargs['mode']))
        return graphJSON
    except Exception:
        return traceback.print_exc()
