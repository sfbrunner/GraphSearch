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

class MongoSession(object):

    def __init__(self, client):
        self.client = client

    @classmethod
    def fromHostPort(cls, host = 'localhost', port = 27017):
        try:
            client = MongoClient(host, port)
        except Exception as e:
            msg = '{0}: Mongo db connection failed: {1}'
            log.info(msg.format(cls.__name__, e))
        else:
            msg = '{0}: Mongo db connection successful'
            log.info(msg.format(cls.__name__))
        return cls(client)

    @classmethod
    def fromConnectionString(cls,
                             connectionString = 'mongodb://localhost:27017/'
                             ):
        try:
            client = MongoClient(connectionString)
        except Exception as e:
            msg = '{0}: Mongo db connection failed: {1}'
            log.info(msg.format(cls.__name__, e))
        else:
            msg = '{0}: Mongo db connection successful'
            log.info(msg.format(cls.__name__))

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
    
    def findRefsOfPMC(self, pmc_lst):
        pmc_cl = []
        for pmc in pmc_lst:
            pmc_cl.append('PMC'+pmc)
        log.debug(pmc_cl)
        pmc_iter = self.client.gs.pmc.find({"article_pmc":{"$in": pmc_cl}})
        pmid_refs = {}
        for pmc in pmc_iter:
            if 'article_pmid' in pmc:
                pmid_refs[pmc['article_pmid']] = pmc['ref_pmid']
        return pmid_refs
    
    def get_metadata_of_pmid_lst(self, pmid_lst):
        log.debug(pmid_lst)
        resultList = []
        pmid_lst_int = [int(pmid) for pmid in pmid_lst]
        pmid_iter = self.client.gs.pubmed1.find({"pmid":{"$in": pmid_lst_int}})
        for doc in pmid_iter:
            summaryDict = self._parse_meta_doc(doc)
            resultList.append(summaryDict)
            
        pmid_iter = self.client.gs.pubmed2.find({"pmid":{"$in": pmid_lst_int}})
        for doc in pmid_iter:
            summaryDict = self._parse_meta_doc(doc)
            resultList.append(summaryDict)
            
        return resultList
    
    def _parse_meta_doc(self, meta_doc):
        summaryDict = {}
        summaryDict['Id'] = meta_doc['pmid']
        summaryDict['Title'] = ''
        summaryDict['Journal'] = ''
        summaryDict['Authors'] = []
        summaryDict['PubDate'] = ''
        summaryDict['Journaliso'] = ''
        
        if 'title' in meta_doc:
            summaryDict['Title'] = meta_doc['title']
            
        if 'journal' in meta_doc:
                summaryDict['Journal'] = meta_doc['journal']
            
        if 'journal_iso' in meta_doc:
                summaryDict['Journaliso'] = meta_doc['journal_iso']
        
        if 'authors' in meta_doc:
            if len(meta_doc['authors']) > 0:
                for author in meta_doc['authors']:
                    if 'last' in author:
                        summaryDict['Authors'].append(author['last'])
                        
        if 'month' in meta_doc:
            summaryDict['PubDate'] = summaryDict['PubDate'] + meta_doc['month']
                
        if 'year' in meta_doc:
            summaryDict['PubDate'] = summaryDict['PubDate'] + ' ' + str(meta_doc['year'])
            
        return summaryDict

    def checkExistPublication(self, pmid):
        if self.findPublicationByPMID(pmid):
            return True
        else:
            return False

    def insertPublication(self, publication):
        db = self.client.GraphSearch
        db.publications.insert(publication)
