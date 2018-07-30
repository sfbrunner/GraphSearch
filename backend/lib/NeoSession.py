'''
This module contains functionality to communicate 
with a mongodb. Default connection is through localhost
on port 27017. Pymongo needs to be installed.
'''
import datetime
import json
from utils.logger import LogHandler
log = LogHandler.get_logger('__name__')

try:
    from pymongo import MongoClient
except ImportError as e:
    print("pymongo.MongoClient could not be imported: " + str(e))

#client = MongoClient()
#client = MongoClient('localhost', 27017)
#client = MongoClient('mongodb://localhost:27017/')

class NeoSession(object):
    
    def __init__(self):
        print 'NeoSession'
    
    def process_search_request(self):
        print 'Search request'
    
    def build_cyper_query(self):
        print 'CyperQuery'
        
    def submit_cypher_query(self):
        print 'Running'
        
    def neo2networkx(self):
        print 'NetworkX'