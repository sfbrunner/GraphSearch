import networkx as nx
from py2neo import Graph

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
            if self.G.nodes[n]['pmcid'] in pmc_hits:
                self.G.node[n]['group'] = 'Searched'
            else:
                self.G.node[n]['group'] = 'Cited'
                
    def assign_pubdate(self):
        '''Only call if networkx object is populated'''
        for n in self.G.nodes:
            self.G.nodes[n]['pubDate'] = self.G.nodes[n]['month'] + ' ' + self.G.nodes[n]['year']

    
class MongoGraph(GConnector):
    
    def __init__(self):
        GConnector.__init__(self)
    
    
class NeoGraph(GConnector):
    
    def __init__(self):
        GConnector.__init__(self)
        self.neo4j = Graph(user='neo4j', password="graphtest")
    
    def process_search_request(self, pmc_hits):
        # Build cypher query
        cypher_query = self.build_cypher_query(pmc_hits)
        
        # Submit search request
        neo_request = self.submit_cypher_query(cypher_query)
        
        # Convert to NetworkX
        neo_subgraph = neo_request.to_subgraph()
        
        self.neo2networkx(neo_subgraph = neo_subgraph)
        
        # Assign search group
        self.assign_search_group(pmc_hits)
        self.assign_pubdate()
        
        # Return NetworkX
        return self.G
    
    def build_cypher_query(self, pmc_hits):
        # Merge PMC hits into a comma-separated string
        pmc_lst = ["'PMC{0}'".format(pmc) for pmc in pmc_hits]
        pmc_str = ', '.join(pmc_lst)
        
        cypher_query = 'MATCH (n:ARTICLE)-[r:CITES]->(k:ARTICLE) WHERE n.pmcid IN [' + pmc_str + '] ' + 'RETURN n,r,k;'
            
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
            author_lst = attr_checked['authors'].split(',')
            
            self.G.add_node(pmid, name=pmid, title=attr_checked['title'],
                            authors_all=author_lst, authors=author_lst[0:3],
                            journal=attr_checked['journal'], journal_iso=attr_checked['journal_iso'],
                            year=str(attr_checked['year']), month=str(attr_checked['month']), 
                            pmcid=attr_checked['pmcid'])

        # Add relationships
        for rel in rels:
            start_node = pmid_map[rel.start_node.identity]
            end_node = pmid_map[rel.end_node.identity]
            self.G.add_edge(start_node, end_node)
            