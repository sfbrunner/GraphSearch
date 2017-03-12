# -*- coding: utf-8 -*-
"""
Created on Sat Feb 25 11:14:35 2017
@author: Ravi Mishra
"""

import datetime
try:
    from pymongo import MongoClient
except ImportError as e:
    print("pymongo.MongoClient could not be imported: " + e)

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
            print("Connection failed: " + e)
        else:
            print("Connection successful")

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

    def queryRequest(self):
        pass

if __name__ == "__main__":
    session = MongoSession.fromConnectionString()
    #db = client.test_1
    testRequest = {"author": "Mike",
            "text": "My first blog post!",
            "tags": ["mongodb","python","pymongo"],
            "date": datetime.datetime.utcnow()}
    session.insertRequest(testRequest)
    #posts = db.posts
    #result = posts.insert_one(post)
    #print result.inserted_id
    #print pymongo.version
    #con = Connection()
    # if test_1 does not exist, it will be created
    # db = con.test_1
    # people = db.people
    #print db.name


