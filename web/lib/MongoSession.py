'''
This module contains functionality to communicate 
with a mongodb. Default connection is through localhost
on port 27017. Pymongo needs to be installed.
'''
import datetime
import json

try:
    from pymongo import MongoClient
except ImportError as e:
    print("pymongo.MongoClient could not be imported: " + str(e))

#client = MongoClient()
#client = MongoClient('localhost', 27017)
#client = MongoClient('mongodb://localhost:27017/')

class MongoSession(object):

    def __init__(self, client):
        self.client = client

    @classmethod
    def fromHostPort(cls, host = 'localhost', port = 27017):
        try:
            client = MongoClient(host, port)
        except Exception as e:
            print("Connection failed: " + e)
        else:
            print("Connection successful")
        return cls(client)

    @classmethod
    def fromConnectionString(cls,
                             connectionString = 'mongodb://localhost:27017/'
                             ):
        try:
            client = MongoClient(connectionString)
        except Exception as e:
            print("mongodb Connection failed: " + e)
        else:
            print("mongodb connection successful")

        return cls(client)

    def insertRequest(self, request):
        """
        Store request to Mongo DB
        """

        try:
            db = self.client.Requests
            requests = db.requests
            result = requests.insert_one(request)
        except Exception as e:
            print("db not found: " + e)
        else:
            print("Request stored in db: " + str(result.inserted_id))

    def findRequest(self, query = '{}'):
        try:
            db = self.client.Requests
            requests = db.requests
            result = requests.find_one(query)
        except Exception as e:
            print("db not found: " + e)
        else:
            print(str(result))

    def findPublication(self, query = '{}', projection = '{}'):
        db = self.client.GraphSearch
        publications = db.publications
        result = publications.find(query, projection)		
        return result
        
    def findPublicationByPMID(self, pmid):
        db = self.client.GraphSearch
        return db.publications.find_one({"pmid" : str(pmid)}, {"_id" : 0})

    def checkExistPublication(self, pmid):
        if self.findPublicationByPMID(pmid):
            return True
        else:
            return False

    def insertPublication(self, publication):
        db = self.client.GraphSearch
        db.publications.insert(publication)
