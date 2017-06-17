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

    def get_cy_json(self):
        self._addWeightsToGraph()
        n_json = json_graph.node_link_data(self.G)

        # Parse nodes
        #from IPython.core.debugger import Tracer; Tracer()()
        node_lst = []
        id_lst = [] # Due to networkx' format, edges refer to nodes in the form of their list position, so we'll store their position here.
        for node in n_json['nodes']:
            node_lst.append({'data': {'id':node['id'], 'name': node['id']}}) #, 'label': node['id']}})
            id_lst.append(node['id'])
    
        # Parse edges
        #from IPython.core.debugger import Tracer; Tracer()()
        edge_lst = []
        for edge in n_json['links']:
            edge_lst.append({'data':{'id':'{a:d}_{b:d}'.format(a=edge['source'], b=edge['target']), 
                        'source':id_lst[edge['source']], 
                        'target':id_lst[edge['target']] }})
        cy_dict = {'nodes': node_lst, 'edges': edge_lst}

        return jsonify(cy_dict)
    
    def extract_by_connectivity(self, connectivity=2):
        '''
        Removes nodes with < [connectivity] edges
        
        Args:
        connectivity: cutoff for connectivity of node
        '''
        # Add the pre-calculated weights back to the graph
        self._addWeightsToGraph()
        
        # Identify nodes that adhere to connectivity filter
        new_nodes = [n for n, attrdict in self.G.node.items() if len(self.G.neighbors(n)) > connectivity]
        
        # Create new subgraph with filtered nodes
        self.G = self.G.subgraph(new_nodes)
