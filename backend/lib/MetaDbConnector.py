from MongoSession import MongoSession

from utils.logger import LogHandler
log = LogHandler.get_logger('__name__')


class MetaDbConnector(object):
    
    def __init__(self):
        log.info('Initialised MetaDbConnector instance.')
        
        
class MongoMeta(MetaDbConnector):
    
    def __init__(self):
        
        MetaDbConnector.__init__(self)
        
    def add_meta_to_graph(self, nx_graph):
        # Get node IDs of graph
        pmid_lst = [nx_graph.node[n]['name'] for n in nx_graph]
        
        # Request metadata from Db
        meta_data = self.get_metadataList_from_mongo(pmid_lst)
        
        # Update nx_graph with metadata
        nx_graph = self.add_metadata_to_graph(nx_graph, meta_data)
        
        # Return nx_graph
        return nx_graph
    
    def get_metadataList_from_mongo(self, pmid_lst):
        mongoSession = MongoSession.fromConnectionString()
        return mongoSession.get_metadata_of_pmid_lst(pmid_lst)
    
    def add_metadata_to_graph(self, nx_graph, meta_data):  
        node_flag_lst = []
        for node in nx_graph:
            dataDict_lst = [dict for dict in meta_data if str(dict['Id']) == str(nx_graph.node[node]['name'])]
            log.debug('dataDict_lst:')
            log.debug(dataDict_lst)
            if len(dataDict_lst)>0:
                dataDict = dataDict_lst[0]
                nx_graph.node[node]['journal'] = dataDict['Journal']
                nx_graph.node[node]['journal_iso'] = dataDict['Journaliso']
                nx_graph.node[node]['title'] = dataDict['Title']
                nx_graph.node[node]['pubDate'] = dataDict['PubDate']
                nx_graph.node[node]['year'] = dataDict['Year']
                nx_graph.node[node]['authors'] = ', '.join(dataDict['Authors'][0:3])
                nx_graph.node[node]['authors_all'] = dataDict['Authors']
            else:
                node_flag_lst.append(node)
        
        # Remove nodes that do not have metadata
        for node in node_flag_lst:
            nx_graph.remove_node(node)
            
        return nx_graph