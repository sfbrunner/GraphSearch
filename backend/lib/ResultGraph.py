import networkx as nx
import json
from flask import jsonify
from networkx.readwrite import json_graph
from utils.logger import LogHandler
log = LogHandler.get_logger('__name__')
from numpy import sqrt

class ResultGraph():

    def __init__(self):
        # Initialise NetworkX graph
        self.G = nx.Graph()
        self.citationWeight = {}

    def add_publication(self, pmid, cite_lst):
        
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
    
    def populate_from_cite_dict(self, cite_dict):
        for pmid in cite_dict:
            self.add_publication(pmid, cite_dict[pmid])
        # Add the pre-calculated weights back to the graph
        self._addWeightsToGraph()

    def _addWeightsToGraph(self):
        for citation in self.citationWeight:
            log.debug(citation)
            #from IPython.core.debugger import Tracer; Tracer()()
            self.G.node[str(citation)]['weight'] = self.citationWeight[str(citation)] 

    def get_json(self):
        self._addWeightsToGraph()
        d = json_graph.node_link_data(self.G)
        return jsonify(d) 

    def get_graph(self):
        self._addWeightsToGraph()
        return json_graph.node_link_data(self.G)

    def get_cy_json(self):
        n_json = json_graph.node_link_data(self.G)

        # Parse nodes
        node_lst = []
        id_lst = [] # Due to networkx' format, edges refer to nodes in the form of their list position, so we'll store their position here.
        for node in n_json['nodes']:
            node_lst.append({'data': {'id':node['id'], 
                                      'name': node['id'], 
                                      'group':node['group'],
                                      'title':node['title'],
                                      'journal':node['journal'],
                                      'pubDate':node['pubDate'],
                                      'authors':node['authors'] + ' ...'}}) #, 'label': node['id']}})
            id_lst.append(node['id'])
    
        # Parse edges
        edge_lst = []
        for edge in n_json['links']:
            #from IPython.core.debugger import Tracer; Tracer()()
            #edge_lst.append({'data':{'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
            #            'source':id_lst[int(edge['source'])], 
            #            'target':id_lst[int(edge['target'])] }})
            edge_lst.append({'data':{'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
                        'source':edge['source'], 
                        'target':edge['target'] }})
        cy_dict = {'nodes': node_lst, 'edges': edge_lst}
        
        return json.dumps(cy_dict)
    
    def get_sigma_json(self):
        n_json = json_graph.node_link_data(self.G)

        # Parse nodes
        node_lst = []
        id_lst = [] # Due to networkx' format, edges refer to nodes in the form of their list position, so we'll store their position here.
        for node in n_json['nodes']:
            node_lst.append({'id':node['id'], 
                                      'label': node['id'], 
                                      'group':node['group'],
                                      'title':node['title'],
                                      'journal':node['journal'],
                                      'pubDate':node['pubDate'],
                                      'authors':node['authors'] + ' ...'}) #, 'label': node['id']}})
            id_lst.append(node['id'])
    
        # Parse edges
        edge_lst = []
        for edge in n_json['links']:
            #from IPython.core.debugger import Tracer; Tracer()()
            #edge_lst.append({'data':{'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
            #            'source':id_lst[int(edge['source'])], 
            #            'target':id_lst[int(edge['target'])] }})
            edge_lst.append({'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
                        'source':edge['source'], 
                        'target':edge['target'], 'label':'CITES' })
        cy_dict = {'nodes': node_lst, 'edges': edge_lst}
        
        return json.dumps(cy_dict)
    
    def get_vis_json(self):
        n_json = json_graph.node_link_data(self.G)

        # Parse nodes
        node_lst = []
        id_lst = [] # Due to networkx' format, edges refer to nodes in the form of their list position, so we'll store their position here.
        for node in n_json['nodes']:
            node_lst.append({'id':node['id'], 
                                      'label': node['id'], 
                                      'group':node['group'],
                                      'title':node['title'],
                                      'journal':node['journal'],
                                      'pubDate':node['pubDate'],
                                      'authors':node['authors'] + ' ...'}) #, 'label': node['id']}})
            id_lst.append(node['id'])
    
        # Parse edges
        edge_lst = []
        for edge in n_json['links']:
            #from IPython.core.debugger import Tracer; Tracer()()
            #edge_lst.append({'data':{'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
            #            'source':id_lst[int(edge['source'])], 
            #            'target':id_lst[int(edge['target'])] }})
            edge_lst.append({'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
                        'from':edge['source'], 
                        'to':edge['target'] })
        cy_dict = {'nodes': node_lst, 'edges': edge_lst}
        
        return json.dumps(cy_dict)
    
    def get_dataui_json(self):
        n_json = json_graph.node_link_data(self.G)
        
        # Calculate coordinates
        coordinates = self.calculate_coords()
        
        # Parse nodes
        node_lst = []
        id_lst = [] # Due to networkx' format, edges refer to nodes in the form of their list position, so we'll store their position here.
        for node in n_json['nodes']:
            node_lst.append({'id':node['id'], 
                             'x':coordinates[node['id']][0],
                             'y':coordinates[node['id']][1],
                             'size':10,
                             'opacity':0.8,
                             'type':'ref',
                                      'label': node['id'], 
                                      'group':node['group'],
                                      'title':node['title'],
                                      'journal':node['journal'],
                                      'pubDate':node['pubDate'],
                                      'authors':node['authors'] + ' ...'}) #, 'label': node['id']}})
            id_lst.append(node['id'])
    
        # Parse edges
        edge_lst = []
        for edge in n_json['links']:
            #from IPython.core.debugger import Tracer; Tracer()()
            #edge_lst.append({'data':{'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
            #            'source':id_lst[int(edge['source'])], 
            #            'target':id_lst[int(edge['target'])] }})
            edge_lst.append({'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
                        'source':id_lst[int(edge['source'])], 
                        'target':id_lst[int(edge['target'])] })
        cy_dict = {'nodes': node_lst, 'links': edge_lst}
        
        return json.dumps(cy_dict)
    
    def extract_by_connectivity(self, connectivity=2):
        '''
        Removes nodes with < [connectivity] edges
        
        Args:
        connectivity: cutoff for connectivity of node
        '''
        
        # Identify nodes that adhere to connectivity filter
        new_nodes = [n for n, attrdict in self.G.node.items() if len(list(self.G.neighbors(n))) > connectivity]
        
        # Create new subgraph with filtered nodes
        self.G = nx.Graph(self.G.subgraph(new_nodes))
        
    def add_metadata_to_graph(self, metadataList):  
        node_flag_lst = []
        for node in self.G:
            #print node
            #print (self.G.node[node]['name'],)
            #print self.G.node[node]
            #print [dict for dict in metadataList if str(dict['Id']) == str(self.G.node[node]['name'])]
            dataDict_lst = [dict for dict in metadataList if str(dict['Id']) == str(self.G.node[node]['name'])]
            log.debug('dataDict_lst:')
            log.debug(dataDict_lst)
            if len(dataDict_lst)>0:
                dataDict = dataDict_lst[0]
                self.G.node[node]['journal'] = dataDict['Journal']
                self.G.node[node]['title'] = dataDict['Title']
                self.G.node[node]['pubDate'] = dataDict['PubDate']
                self.G.node[node]['authors'] = ', '.join(dataDict['Authors'][0:3])
            else:
                node_flag_lst.append(node)
        
        # Remove nodes that do not have metadata
        for node in node_flag_lst:
            self.G.remove_node(node)
            
    def calculate_coords(self):
        '''
        Calculate network coordinates using NetworkX
        '''
        log.info('Calculating network coordinates...')
        coordinates = nx.spring_layout(self.G, k=1/(sqrt(nx.number_of_nodes(self.G))*0.3), iterations=50)
        log.info('... done calculating network coordinates.')
        return coordinates
    
    @property        
    def nodeIds(self):
        return [self.G.node[n]['name'] for n in self.G]
        
            
            
            
