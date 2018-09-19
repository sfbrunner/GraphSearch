import json
import networkx as nx
from networkx.readwrite import json_graph
from numpy import sqrt
from colour import Color
import colorsys
from collections import Counter
import itertools

from utils.logger import LogHandler
log = LogHandler.get_logger('__name__')

class FrontEndGraph(object):
    
    def __init__(self, G):
        ''' 
        '''
        self.G = G
        
    def get_graph_by_format(g_format = 'cyto'):
        if g_format == 'cyto':
            self.get_cyto_graph()
    
    def get_max_degree_cited(self):
        max_degree = 1.0
        group_attr = nx.get_node_attributes(self.G, 'group')

        for node in self.G:
            this_degree = self.G.degree(node)
            self.G.nodes[node]['deg'] = this_degree

            #if group_attr[node] == 'Cited':
            if this_degree > max_degree:
                max_degree = this_degree

        return max_degree
    
    def get_search_stats(self, n_json):
        '''
        Extract search statistics from JSON of networkx graph
        '''
        # Get number of blue nodes (search results)
        num_results = len([node for node in n_json['nodes'] if node['group'] == 'Searched'])
        print num_results
        # Get number of red nodes (citations)
        num_citations = len([node for node in n_json['nodes'] if node['group'] == 'Cited'])

        # Get number of edges
        num_links = len(n_json['links'])

        # Get max degree of citation nodes
        max_degree = self.get_max_degree_cited()

        # Get top journals
        n_most_common = 10
        journal_lst = [node['journal_iso'] for node in n_json['nodes']]
        journal_counts = Counter(journal_lst)
        top_journals = journal_counts.most_common(n_most_common)
        top_journals_list = ['{0} ({1})'.format(str(journal[0]), str(journal[1])) for journal in top_journals]
        top_journals = ', '.join(['{0} ({1})'.format(journal[0], journal[1]) for journal in top_journals])

        # Get top authors
        author_lst = [node['authors_all'] for node in n_json['nodes']]
        author_lst = list(itertools.chain.from_iterable(author_lst))
        author_lst = [author for author in author_lst if author!='']
        author_counts = Counter(author_lst)
        top_authors = author_counts.most_common(n_most_common)
        top_authors_list = ['{0} ({1})'.format(author[0].encode('utf-8'), str(author[1])) for author in top_authors]
        top_authors = ', '.join(['{0} ({1})'.format(author[0].encode('utf-8'), str(author[1])) for author in top_authors])

        # Journals
        #from IPython.core.debugger import Tracer; Tracer()()
        top_journals_dict = {str(journal[0].encode('utf-8')): journal[1] for journal in journal_counts.most_common(n_most_common)}
        top_author_dict = {str(author[0].encode('utf-8')): author[1] for author in author_counts.most_common(n_most_common)}

        # Get list of publication years
        pub_years = []
        for node in n_json['nodes']:
            try:
                pub_years.append(int(node['year']))
            except:
                continue
        #pub_years = [int(node['year']) for node in n_json['nodes']]

        # Evaluate number of required bins
        if pub_years:
            min_year = min(pub_years)
            min_year = min_year - (min_year%2)
            max_year = max(pub_years)
            max_year = max_year + (max_year%2)
            num_bin = (max_year-min_year)/2
        else:
            num_bin = 0

        return({'num_results': num_results, 
                'num_citations': num_citations, 
                'num_links': num_links, 
                'max_degree_cited': max_degree, 
                'top_journals': top_journals, 
                'top_journal_dict': top_journals_dict,
                'top_author_dict': top_author_dict,
                'top_authors': top_authors, 
                'pub_years':{'values': pub_years, 'num_bin':num_bin}})
    
    def get_cyto_graph(self):
        # Get max citation degree
        max_degree = self.get_max_degree_cited()
        log.info('Max degree: ' + str(max_degree))
        
        # Parse nodes
        n_json = json_graph.node_link_data(self.G)

        # Get network stats
        network_stats = self.get_search_stats(n_json)

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
                                      'key': node['id'], 'label': node['journal'],
                                      'group':'Cited',
                                      'title':node['title'],
                                      'journal':node['journal'],
                                      'journal_iso':node['journal_iso'],
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
        cy_dict = {'stats': network_stats, 'graph': {'nodes': node_lst, 'edges': edge_lst}}
        
        #from IPython.core.debugger import Tracer; Tracer()()
        return json.dumps(cy_dict)
