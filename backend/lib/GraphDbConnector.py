import networkx as nx
from py2neo import Graph

from MongoSession import MongoSession

from utils.logger import LogHandler
log = LogHandler.get_logger('__name__')

class GConnector(object):
    
    def __init__(self):
        self.G = nx.Graph()
        
    @property        
    def nodeIds(self):
        return [self.G.node[n]['name'] for n in self.G]
    
    def assign_search_group(self, pmc_hits):
        '''Only call if networkx object is populated'''
        for n in self.G.nodes:
            #from IPython.core.debugger import Tracer; Tracer()()
            this_pmcid = self.G.nodes[n]['pmcid'].replace('PMC','')
            if this_pmcid in pmc_hits:
                self.G.node[n]['group'] = 'Searched'
            else:
                self.G.node[n]['group'] = 'Cited'
                
    def assign_pubdate(self):
        '''Only call if networkx object is populated'''
        for n in self.G.nodes:
            self.G.nodes[n]['pubDate'] = self.G.nodes[n]['month'] + ' ' + self.G.nodes[n]['year']
            
    def prune(self, connectivity=2):
        '''
        Removes nodes with < [connectivity] edges
        
        Args:
        connectivity: cutoff for connectivity of node
        '''
        
        # Evaluate max degree
        max_degree = self.get_max_degree_cited()
        
        if max_degree>2:
            # Step 1: Identify nodes that adhere to connectivity filter
            new_nodes = [n for n, attrdict in self.G.node.items() if self.G.degree(n) > connectivity]

            # Remove the pruned nodes
            self.G.remove_nodes_from([node for node in self.G if node not in set(new_nodes)])

        # Step 2: remove singleton nodes (unconnected) from the pruned graph
        new_nodes = [n for n, attrdict in self.G.node.items() if self.G.degree(n) > 0]

        # Remove the pruned nodes
        self.G.remove_nodes_from([node for node in self.G if node not in set(new_nodes)])
    
    def get_max_degree_cited(self):
        max_degree = 1.0

        for n in self.G.nodes:
            this_degree = self.G.degree(n)
            
            if self.G.nodes[n]['group'] == 'Cited':
                if this_degree > max_degree:
                    max_degree = this_degree

        return max_degree
    
    def get_max_degree(self):
        degrees = [self.G.degree(n) for n in self.G.nodes]
        return max(degrees)

    
class MongoGraph(GConnector):
    
    def __init__(self):
        GConnector.__init__(self)
        self.citationWeight = {}
    
    def process_search_request(self, pmc_hits, retmax=200):
        log.info('Retrieving citation data')
        cite_dict = self.get_citations_from_fulltext_mongo(pmc_hits, retmax=retmax)
        log.info('Populating graph')
        self.populate_from_cite_dict(cite_dict)
        
        return self.G
    
    def get_citations_from_fulltext_mongo(self, pmc_hits, retmax=20):
        #searched_pmc = self.get_pubmed_results_from_fulltext(fulltext, retmax)
        mongoSession = MongoSession.fromConnectionString()
        return mongoSession.findRefsOfPMC(pmc_hits)
    
    def populate_from_cite_dict(self, cite_dict):
        #from IPython.core.debugger import Tracer; Tracer()()
        for pmid in cite_dict:
            self.add_publication(pmid, cite_dict[pmid])
        # Add the pre-calculated weights back to the graph
        self._addWeightsToGraph()
        
    def add_publication(self, pmid, cite_lst):
        #from IPython.core.debugger import Tracer; Tracer()()
        for citation in cite_lst:
            self.G.add_edge(str(pmid), str(citation))
            if str(pmid) in self.citationWeight.keys():
                self.citationWeight[str(pmid)] += 1
            else:
                self.citationWeight[str(pmid)] = 1
            
        for n in self.G:
            # Add 'name' tag to each node
            self.G.node[n]['name'] = str(n)
            
            if str(self.G.node[n]['name']) == str(pmid):
                self.G.node[n]['group'] = 'Searched'
            elif int(self.G.node[n]['name']) in cite_lst:
                self.G.node[n]['group'] = 'Cited'

    def _addWeightsToGraph(self):
        for citation in self.citationWeight:
            log.debug(citation)
            #from IPython.core.debugger import Tracer; Tracer()()
            self.G.node[str(citation)]['weight'] = self.citationWeight[str(citation)] 
    
    
class NeoGraph(GConnector):
    
    def __init__(self):
        GConnector.__init__(self)
        self.neo4j = Graph(user='neo4j', password="graphtest")
    
    def process_search_request(self, pmc_hits):
        # Build cypher query
        cypher_query = self.build_cypher_query(pmc_hits)
        
        # Submit search request
        log.info('Submitting cypher query {0}'.format(cypher_query))
        neo_request = self.submit_cypher_query(cypher_query)
        
        # Convert to NetworkX
        log.info('Converting Neo4j graph to NetworkX')
        neo_subgraph = neo_request.to_subgraph()
        
        self.neo2networkx(neo_subgraph = neo_subgraph)
        
        # Assign search group
        self.assign_search_group(pmc_hits)
        self.assign_pubdate()
        
        # Prune
        log.info('Pruning graph')
        self.prune(connectivity=1)
        
        # Return NetworkX
        log.info('Returning NetworkX result from GraphDB')
        return self.G
    
    def build_cypher_query(self, pmc_hits):
        # Merge PMC hits into a comma-separated string
        pmc_lst = ["'PMC{0}'".format(pmc) for pmc in pmc_hits]
        pmc_str = ', '.join(pmc_lst)
        
        # Query that only returns citations of search hits
        cypher_query = 'MATCH (n:ARTICLE)-[r:CITES]->(k:ARTICLE) WHERE n.pmcid IN [' + pmc_str + '] ' + 'RETURN n,r,k;'
        # Query that returns citations both ways
        #cypher_query = 'MATCH (k:ARTICLE)-[r:CITES]->(n:ARTICLE) WHERE n.pmcid IN [' + pmc_str + '] ' + \
        #'MATCH (n)-[r2:CITES]->(k2:ARTICLE) RETURN n, r, r2, k, k2;'
    
        return cypher_query
        
    def submit_cypher_query(self, cypher_query):
        neo_request = self.neo4j.run(cypher_query)
        return neo_request
        
    def neo2networkx(self, neo_subgraph):
        # Extract nodes and relationships from neo_subgraph
        nodes = neo_subgraph.nodes
        rels = neo_subgraph.relationships

        # Set up dictionary to map Neo4j IDs to PMID
        pmid_map = {}

        # Add all nodes
        for node in nodes:
            attr = dict(node)
            pmid = attr['pmid']
            neo_id = node.identity
            pmid_map[neo_id] = pmid
            
            # Build attributes
            attr_checked = {'title':'', 'authors':'', 'journal':'', 'journal_iso':'', 'year':'', 'month':'', 'pmcid':''}
            
            for key in attr_checked:
                if key in attr.keys():
                    attr_checked[key] = attr[key]
            
            # build node tuple
            #node_tuple = (pmid, {'name':pmid})
            
            #print node
            author_formatted = self.format_authors(attr_checked['authors'])
            
            self.G.add_node(pmid, name=pmid, title=attr_checked['title'],
                            authors_all=author_formatted['authors_all'], authors=author_formatted['authors'],
                            journal=attr_checked['journal'], journal_iso=attr_checked['journal_iso'],
                            year=str(attr_checked['year']), month=str(attr_checked['month']), 
                            pmcid=attr_checked['pmcid'])

        # Add relationships
        for rel in rels:
            start_node = pmid_map[rel.start_node.identity]
            end_node = pmid_map[rel.end_node.identity]
            self.G.add_edge(start_node, end_node)
            
    @staticmethod
    def format_authors(authors):
        
        if authors != '':
            author_lst = authors.split(', ')
        else:
            return {'authors_all':[], 'authors':''}
        
        # Construct last names
        last_names = []
        for author in author_lst:
            last = author.split(' ')[0]
            last_names.append(last)
        
        if len(last_names) < 5:
            author_joined = ', '.join(last_names[0:4])
        else:
            author_joined = ', '.join(last_names[0:3])
            author_joined += ', (...), '
            author_joined += last_names[-1]
        
        return {'authors_all':last_names, 'authors':author_joined}