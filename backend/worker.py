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

graphJSON = {
        "links": [
            {
                
                    "id": "0_2",
                    "source": "3114864",
                    "target": "4989131"
                
            },
            {
                
                    "id": "0_3",
                    "source": "3114864",
                    "target": "4897148"
                
            },
            {
                
                    "id": "1_2",
                    "source": "3507582",
                    "target": "4989131"
                
            },
            {
                
                    "id": "1_3",
                    "source": "3507582",
                    "target": "4897148"
                
            },
            {
                
                    "id": "2_3",
                    "source": "4989131",
                    "target": "4897148"
                
            }
        ],
        "nodes": [
            {
                
                    "x": 100,
                    "y": 200,
                    "authors": "Qu HQ, Li Q, Rentfro AR ...",
                    "group": "Cited",
                    "id": "3114864",
                    "journal": "PLoS ONE",
                    "name": "3114864",
                    "pubDate": "2011 Jun 14",
                    "title": "The Definition of Insulin Resistance Using HOMA-IR for Americans of Mexican Descent Using Machine Learning"
                
            },
            {
                
                    "x": 200,
                    "y": 200,
                    "authors": "Qu HQ, Li Q, Lu Y ...",
                    "group": "Cited",
                    "id": "3507582",
                    "journal": "Diabetes Care",
                    "name": "3507582",
                    "pubDate": "2012 Nov 14",
                    "title": "Ancestral Effect on HOMA-IR Levels Quantitated in an American Population of Mexican Origin"
                
            },
            {
                
                    "x": 200,
                    "y": 100,
                    "authors": "Bermudez V, Salazar J, Martinez MS ...",
                    "group": "Searched",
                    "id": "4989131",
                    "journal": "Advances in Preventive Medicine",
                    "name": "4989131",
                    "pubDate": "2016 Aug 4",
                    "title": "Prevalence and Associated Factors of Insulin Resistance in Adults from Maracaibo City, Venezuela"
                
            },
            {
                
                    "x": 100,
                    "y": 100,
                    "authors": "Bermudez V, Rojas J, Martinez MS ...",
                    "group": "Searched",
                    "id": "4897148",
                    "journal": "International Scholarly Research Notices",
                    "name": "4897148",
                    "pubDate": "2014 Oct 29",
                    "title": "Epidemiologic Behavior and Estimation of an Optimal Cut-Off Point for Homeostasis Model Assessment-2 Insulin Resistance: A Report from a Venezuelan Population"
                
            }
        ]
    }

@app.task
def getGraph(*args, **kwargs):
    '''returns the graph json in cytoscape format'''
    try:
        graphSession = GraphSession(*args, **kwargs)
        #graphJSON = json.loads(graphSession.get_cy_json())
        return graphJSON
    except Exception:
        return traceback.print_exc()
