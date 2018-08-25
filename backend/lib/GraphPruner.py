import networkx as nx
from NetworkxUtils import NetworkxUtils

from utils.logger import LogHandler
log = LogHandler.get_logger('__name__')

nx_utils = NetworkxUtils()

class GraphPruner(object):
    
    def __init__(self, nx_graph):
        log.info('Initialised GraphPruner instance')
        self.G = nx_graph
        
    def remove_singleton_nodes(self):
        new_nodes = [n for n, attrdict in self.G.node.items() if self.G.degree(n) > 0]

        # Remove the pruned nodes
        self.G.remove_nodes_from([node for node in self.G if node not in set(new_nodes)])
        

class CitationPruner(GraphPruner):
    
    def __init__(self, nx_graph):
        GraphPruner.__init__(self, nx_graph)
        
    def prune_graph(self, connectivity=2):
        '''
        Removes nodes with < [connectivity] edges
        
        Args:
        connectivity: cutoff for connectivity of node
        '''
        
        # Evaluate max degree
        max_degree = nx_utils.get_max_degree_cited(self.G)
        
        if max_degree>connectivity:
            # Step 1: Identify nodes that adhere to connectivity filter
            new_nodes = [n for n, attrdict in self.G.node.items() if self.G.degree(n) > connectivity]

            # Remove the pruned nodes
            self.G.remove_nodes_from([node for node in self.G if node not in set(new_nodes)])

        # Step 2: remove singleton nodes (unconnected) from the pruned graph
        self.remove_singleton_nodes()
        
        return self.G
        