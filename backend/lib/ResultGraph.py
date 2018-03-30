import networkx as nx
import json
from flask import jsonify
from networkx.readwrite import json_graph
from utils.logger import LogHandler
log = LogHandler.get_logger('__name__')
from numpy import sqrt
from colour import Color
import colorsys

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

    def get_graph(self, graph_format=None):
        if graph_format == None:
            self._addWeightsToGraph()
            return json_graph.node_link_data(self.G)
        elif graph_format == "cytoscape":
            return self.get_cy_json()
        elif graph_format == "sigma":
            return self.get_sigma_json()
        elif graph_format == "visjs":
            return self.get_vis_json()
        elif graph_format == "dataui":
            return self.get_dataui_json()
        elif graph_format == "reactd3graph":
            return self.get_reactd3_json()
        else:
            raise Exception("Graph format not known")

    def get_cy_json(self):
        
        # Find max cited degree
        max_degree = 1.0
        group_attr = nx.get_node_attributes(self.G, 'group')
        for node in self.G:
            this_degree = self.G.degree(node)
            self.G.nodes[node]['deg'] = this_degree

            if group_attr[node] == 'Cited':
                if this_degree > max_degree:
                    max_degree = this_degree
        log.info('Max degree: ' + str(max_degree))
        # Parse nodes
        n_json = json_graph.node_link_data(self.G)

        node_lst = []
        id_lst = [] # Due to networkx' format, edges refer to nodes in the form of their list position, so we'll store their position here.
        for node in n_json['nodes']:

            # Define cited node color
            this_sat = 0.1 + 0.9*(float(node['deg']) / float(max_degree))
            if(this_sat>1.0):
                this_sat = 1.0
            rgb_col = colorsys.hsv_to_rgb(h=0, s=this_sat, v=1)
            node_col = Color(red = rgb_col[0], green = rgb_col[1], blue = rgb_col[2])

            node_lst.append({'data': {'id':node['id'], 
                                      'name': node['id'], 
                                      'key': node['id'],
                                      'group':node['group'],
                                      'title':node['title'],
                                      'journal':node['journal'],
                                      'pubDate':node['pubDate'],
                                      'authors':node['authors'], 'cite_color':'black', 
                                      'node_col':node_col.hex }}) #, 'label': node['id']}})
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
                                      'authors':node['authors'],
                                      'key':node['id'],
                                      'x':0,
                                      'y':0,
                                      'size':20,
                                      'color':'#ff0000' + ' ...'}) #, 'label': node['id']}})
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
        coordinates = self.calculate_coords(scale=3)
        
        # Parse nodes
        node_lst = []
        node_dict = {}
        id_lst = [] # Due to networkx' format, edges refer to nodes in the form of their list position, so we'll store their position here.
        for node in n_json['nodes']:
            nodeFillColor = '#e03131' if node['group'] == 'Searched' else '#5f3dc4'
            nodeSize = 10 if node['group'] == 'Searched' else 8
            node = {'id': node['id'], 
                    'x': coordinates[node['id']][0]*3,
                    'y': coordinates[node['id']][1]*3,
                    'size': nodeSize,
                    'opacity': 0.8,
                    'type': 'ref',
                    'label': "", #'<a href=\"https://www.ncbi.nlm.nih.gov/pubmed/{a:s}\">{a:s}</a>'.format(a=node['id']), 
                    'group': node['group'],
                    'fill': nodeFillColor,
                    'title': node['title'],
                    'journal': node['journal'],
                    'pubDate': node['pubDate'],
                    'authors': node['authors'] + ' ...'}
            node_lst.append(node) #, 'label': node['id']}})
            #id_lst.append(node['id'])
            node_dict[node['id']] = node
    
        # Parse edges
        edge_lst = []
        for edge in n_json['links']:
            #from IPython.core.debugger import Tracer; Tracer()()
            #edge_lst.append({'data':{'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
            #            'source':id_lst[int(edge['source'])], 
            #            'target':id_lst[int(edge['target'])] }})
            edge_lst.append({'id': '{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
                        'source': node_dict[edge['source']], 
                        'target': node_dict[edge['target']] })
        cy_dict = {'nodes': node_lst, 'links': edge_lst}
        
        return json.dumps(cy_dict)
    
    def get_reactd3_json(self):
        n_json = json_graph.node_link_data(self.G)
        
        # Calculate coordinates
        coordinates = self.calculate_coords(scale=3)
        
        # Parse nodes
        node_lst = []
        node_dict = {}
        id_lst = [] # Due to networkx' format, edges refer to nodes in the form of their list position, so we'll store their position here.
        for node in n_json['nodes']:
            nodeFillColor = '#e03131' if node['group'] == 'Searched' else '#5f3dc4'
            nodeSize = 10 if node['group'] == 'Searched' else 8
            node = {'id': node['id'], 
                    'x': coordinates[node['id']][0]*3,
                    'y': coordinates[node['id']][1]*3,
                    'size': nodeSize,
                    'opacity': 0.8,
                    'type': 'ref',
                    'label': "", #'<a href=\"https://www.ncbi.nlm.nih.gov/pubmed/{a:s}\">{a:s}</a>'.format(a=node['id']), 
                    'group': node['group'],
                    'fill': nodeFillColor,
                    'title': node['title'],
                    'journal': node['journal'],
                    'pubDate': node['pubDate'],
                    'authors': node['authors'] + ' ...'}
            node_lst.append(node) #, 'label': node['id']}})
            #id_lst.append(node['id'])
            node_dict[node['id']] = node
    
        # Parse edges
        edge_lst = []
        for edge in n_json['links']:
            #from IPython.core.debugger import Tracer; Tracer()()
            #edge_lst.append({'data':{'id':'{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
            #            'source':id_lst[int(edge['source'])], 
            #            'target':id_lst[int(edge['target'])] }})
            edge_lst.append({'id': '{a:s}_{b:s}'.format(a=edge['source'], b=edge['target']), 
                        'source': edge['source'], 
                        'target': edge['target'] })
        cy_dict = {'nodes': node_lst, 'links': edge_lst}
        
        return json.dumps(cy_dict)
    
    def extract_by_connectivity(self, connectivity=2):
        '''
        Removes nodes with < [connectivity] edges
        
        Args:
        connectivity: cutoff for connectivity of node
        '''
        
        # Step 1: Identify nodes that adhere to connectivity filter
        new_nodes = [n for n, attrdict in self.G.node.items() if self.G.degree(n) > connectivity]

        # Remove the pruned nodes
        self.G.remove_nodes_from([node for node in self.G if node not in set(new_nodes)])

        # Step 2: remove singleton nodes (unconnected) from the pruned graph
        new_nodes = [n for n, attrdict in self.G.node.items() if self.G.degree(n) > 0]

        # Remove the pruned nodes
        self.G.remove_nodes_from([node for node in self.G if node not in set(new_nodes)])
        
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
            
    def calculate_coords(self, scale=1.0):
        '''
        Calculate network coordinates using NetworkX
        
        Args:
        scaling: factor for scaling. Each coordinate is multiplied by this factor.
        '''
        log.info('Calculating network coordinates...')
        coordinates = nx.spring_layout(self.G, k=1/(sqrt(nx.number_of_nodes(self.G))*0.3), iterations=50, scale=scale)
        log.info('... done calculating network coordinates.')
        return coordinates
    
    @property        
    def nodeIds(self):
        return [self.G.node[n]['name'] for n in self.G]

    def read_json_file(self, filename):
        with open(filename) as f:
            js_graph = json.load(f, encoding='utf-8')
        return json_graph.node_link_graph(js_graph)
        
            
            
            
