class NetworkxUtils(object):
    
    @staticmethod
    def get_max_degree_cited(G):
        max_degree = 1.0

        for n in G.nodes:
            this_degree = G.degree(n)
            
            if G.nodes[n]['group'] == 'Cited':
                if this_degree > max_degree:
                    max_degree = this_degree

        return max_degree
    
    @staticmethod
    def get_max_degree(G):
        degrees = [G.degree(n) for n in G.nodes]
        return max(degrees)