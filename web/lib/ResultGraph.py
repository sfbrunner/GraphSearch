import networkx as nx
import json
from flask import jsonify
from networkx.readwrite import json_graph

class ResultGraph():

    def __init__(self):
        # Initialise NetworkX graph
        self.G = nx.Graph()
        self.citationWeight = {}

    def add_publication(self, pmid, cite_lst):
        for citation in cite_lst:
            self.G.add_edge(pmid, citation)
            if str(pmid) in self.citationWeight.keys():
                self.citationWeight[str(pmid)] += 1
            else:
                self.citationWeight[str(pmid)] = 1
            
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
			
    def _addWeightsToGraph(self):
        for citation in self.citationWeight:
            self.G.node[citation]['weight'] = self.citationWeight[citation] 

    def get_json(self):
        self._addWeightsToGraph()
        d = json_graph.node_link_data(self.G)
        #return json.dumps(d)
        return jsonify(d) 

    def get_graph(self):
        self._addWeightsToGraph()
        return json_graph.node_link_data(self.G)
