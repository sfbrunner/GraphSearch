import networkx as nx
from flask import jsonify
from networkx.readwrite import json_graph

class ResultGraph():

    def __init__(self):
        # Initialise NetworkX graph
        self.G = nx.Graph()

    def add_publication(self, pmid, cite_lst):
        for citation in cite_lst:
            self.G.add_edge(pmid, citation)
            
        for n in self.G:
            # Add 'name' tag to each node
            self.G.node[n]['name'] = str(n)
            
            # Add group tag
            if self.G.node[n]['name'] == str(pmid):
                self.G.node[n]['group'] = 'Searched'
            elif str(self.G.node[n]['name']) in cite_lst:
                self.G.node[n]['group'] = 'Cited'
    
    def populate_from_cite_dict(self, cite_dict):
        for pmid in cite_dict:
            self.add_publication(pmid, cite_dict[pmid])

    def get_json(self):
        
        d = json_graph.node_link_data(self.G)
        return jsonify(d) 
