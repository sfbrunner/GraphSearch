# GraphSession.py
import sys
sys.path.append('..')
import re
from ConnectEutils import ConnectEutils
from MongoSession import MongoSession
from ResultGraph import ResultGraph
from requestFactory import createSearchRequest
from utils.logger import LogHandler
log = LogHandler.get_logger('__name__')
    

class GraphSession(object):

    def __init__(self, userInput, **kwargs):
        self.request = createSearchRequest('Fulltext', userInput)

    def get_cy_json(self, graph_format=None):
        '''Creates cytoscape JSON graph'''

        msg = '{0}: Search input received: {1}'
        log.info(msg.format(self.__class__.__name__, self.request.userInput))

        citations = self.get_citations_from_fulltext_mongo(self.request.userInput, retmax=200)
        resultGraph = ResultGraph()
        resultGraph.populate_from_cite_dict(citations)
        
        #resultGraph.extract_by_connectivity(connectivity=2)
        resultGraph.extract_by_connectivity(connectivity=1)
        resultGraph.extract_by_connectivity(connectivity=0)
        
        # Query metadata
        metadataList = self.get_metadataList_from_mongo(resultGraph.nodeIds)
        resultGraph.add_metadata_to_graph(metadataList)
        
        return resultGraph.get_graph(graph_format=graph_format)

    @staticmethod
    def parseInput(userInput): #check user input with regex?
        return [pmid.strip() for pmid in userInput.split(',')]
    
    @staticmethod
    def escape_user_input(input_parse_fun):
        def wrapper(raw_user_input):
            escaped_user_input = re.escape(raw_user_input)
            return input_parse_fun(escaped_user_input)
        return wrapper

    @staticmethod
    def parse_full_text_input(user_input):
        return user_input.replace(' ', '+')

    @staticmethod
    def loadCitations(pmidList):
        eutils = ConnectEutils()
        mongoSession = MongoSession.fromConnectionString()
        citationDict = {}
        #from IPython.core.debugger import Tracer; Tracer()()
        for pmid in pmidList:
            # TODO: Check if db rec exists while data  is entered
            mongoCursor = mongoSession.findPublicationByPMID(pmid)
            if 0==1:#mongoCursor:
                citationDict[pmid] = mongoCursor['citations']
            else:
                citationDict[pmid] = eutils.get_cited_pub(pmid)
                mongoSession.insertPublication({"pmid" : pmid, "citations" : citationDict[pmid]})
        return citationDict

    @staticmethod
    def getCitationsFromPMIDString(rawUserInput):
        return GraphSession.loadCitations(GraphSession.parseInput(rawUserInput))

    def get_citations_from_fulltext(self, fulltext):
        parsed_input = self.parse_full_text_input(fulltext)
        eutils = ConnectEutils()
        primary_fulltext_results = eutils.get_pmid_from_fulltext(parsed_input)
        msg = '{0}: Found {1} primary search results.'
        log.info(msg.format(self.__class__.__name__, str(len(primary_fulltext_results))))
        return self.loadCitations(primary_fulltext_results)
 
    def get_metadataList_from_idList(self, idList):
        eutils = ConnectEutils()
        return eutils.get_docsummary_from_idList(idList)
    
    def get_metadataList_from_mongo(self, pmid_lst):
        mongoSession = MongoSession.fromConnectionString()
        return mongoSession.get_metadata_of_pmid_lst(pmid_lst)
    
    def get_pubmed_results_from_fulltext(self, fulltext, retmax=20):
        parsed_input = self.parse_full_text_input(fulltext)
        eutils = ConnectEutils()
        return eutils.get_pmid_from_fulltext(parsed_input, retmax=retmax)
 
    def get_citations_from_fulltext_mongo(self, fulltext, retmax=20):
        searched_pmc = self.get_pubmed_results_from_fulltext(fulltext, retmax)
        mongoSession = MongoSession.fromConnectionString()
        return mongoSession.findRefsOfPMC(searched_pmc)
        
        
    
