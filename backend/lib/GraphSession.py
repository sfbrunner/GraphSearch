# GraphSession.py
import sys
sys.path.append('..')
import re
from ConnectEutils import ConnectEutils
from MongoSession import MongoSession
from NeoSession import NeoSession
from ResultGraph import ResultGraph
from FrontEndGraph import FrontEndGraph
from GraphDbConnector import NeoGraph, MongoGraph
from MetaDbConnector import MongoMeta
from GraphPruner import CitationPruner
from requestFactory import createSearchRequest
from utils.logger import LogHandler
import numpy as np

log = LogHandler.get_logger('__name__')
  

class GraphSession(object):

    def __init__(self, userInput, **kwargs):
        self.request = createSearchRequest('Fulltext', userInput)
    
    def get_cy_json(self, graph_format=None, mode='demo'):
        msg = '{0}: Search input received: {1}'
        log.info(msg.format(self.__class__.__name__, self.request.userInput))
        
        if mode=='live':
            log.info('Using live mode for data retrieval.')
            pmc_hits = self.get_pubmed_results_from_fulltext(self.request.userInput, retmax=40)
            
            neo_graph = NeoGraph()
            nx_graph = neo_graph.process_search_request(pmc_hits)
            
            frontendgraph = FrontEndGraph(nx_graph)
            #log.info(frontendgraph.get_cyto_graph())
            return frontendgraph.get_cyto_graph()
        elif mode=='demo':
            log.info('Using demo mode for data retrieval.')
            resultGraph = ResultGraph()
            resultGraph.G = resultGraph.read_json_file('../notebooks/output/demo_network_pubyear.json')
            resultGraph.extract_by_connectivity(connectivity=2)
            return resultGraph.get_graph(graph_format=graph_format)
        else:
            log.info('Unknown data retrieval mode.')
            return None
    
    def get_cy_json_mongo(self, graph_format=None, mode='demo'):
        '''Creates cytoscape JSON graph

        Args:
        mode (default: 'live'): if 'live', then MongoDB will be queried. If 'demo', then a demo dataset is served.
        '''

        msg = '{0}: Search input received: {1}'
        log.info(msg.format(self.__class__.__name__, self.request.userInput.encode('utf-8').strip()))

        if mode=='live':
            log.info('Using live mode for data retrieval.')
            pmc_hits = self.get_pubmed_results_from_fulltext(self.request.userInput, retmax=200)
            
            mongo_graph = MongoGraph()
            nx_graph = mongo_graph.process_search_request(pmc_hits)
            
            log.info('Pruning graph')
            pruner = CitationPruner(nx_graph)
            nx_graph = pruner.prune_graph()
            
            log.info('Acquiring meta data')
            meta_db = MongoMeta()
            nx_graph = meta_db.add_meta_to_graph(nx_graph)
            
            log.info('Formatting graph for frontend')
            frontendgraph = FrontEndGraph(nx_graph)
            #log.info(frontendgraph.get_cyto_graph())
            return frontendgraph.get_cyto_graph()
        elif mode=='demo':
            log.info('Using demo mode for data retrieval.')
            resultGraph = ResultGraph()
            resultGraph.G = resultGraph.read_json_file('../notebooks/output/demo_network_pubyear.json')
            resultGraph.extract_by_connectivity(connectivity=2)
            return resultGraph.get_graph(graph_format=graph_format)
        else:
            log.info('Unknown data retrieval mode.')
            return None
    
    def get_cy_json2(self, graph_format=None, mode='demo'):
        '''Creates cytoscape JSON graph

        Args:
        mode (default: 'live'): if 'live', then MongoDB will be queried. If 'demo', then a demo dataset is served.
        '''

        msg = '{0}: Search input received: {1}'
        log.info(msg.format(self.__class__.__name__, self.request.userInput.encode('utf-8').strip()))

        resultGraph = ResultGraph()
        if mode=='live':
            citations = self.get_citations_from_fulltext_mongo(self.request.userInput, retmax=200)
            resultGraph.populate_from_cite_dict(citations)
            
            # Extract nodes by connectivity, dependending on total number of nodes in graph
            node_num = resultGraph.G.number_of_nodes()
            if(node_num < 100):
                resultGraph.extract_by_connectivity(connectivity=1)
            elif(node_num > 100):
                resultGraph.extract_by_connectivity(connectivity=np.log10(node_num))
            
            # Query metadata
            metadataList = self.get_metadataList_from_mongo(resultGraph.nodeIds)
            resultGraph.add_metadata_to_graph(metadataList)
        elif mode=='demo':
            log.info('Using demo mode for data retrieval.')
            resultGraph.G = resultGraph.read_json_file('../notebooks/output/demo_network_pubyear.json')
            resultGraph.extract_by_connectivity(connectivity=2)
        else:
            log.info('Unknown data retrieval mode.')
            return None
        
        return resultGraph.get_graph(graph_format=graph_format)
    
    def get_cy_json_neo4j(self, graph_format=None, mode='demo'):
        if mode=='live':
            searched_pubs = self.get_pubmed_results_from_fulltext(self.request.userInput, retmax=20)
            
    
    def return_empty_graph(self):
        ''' Returns an empty graph. Useful to generate a default return value in case of errors.
        '''
        return {"graph": {"nodes": [], "edges": []}, 
            "stats": {"num_citations": 0, 
                        "pub_years": {"values": [], "num_bin": 0}, 
                        "num_results": 0, "top_authors": "", "top_journals": "", "top_journals_list": [], 
                        "num_links": 0, "top_authors_list": [], "max_degree_cited": 1.0}}

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
        
        
    
