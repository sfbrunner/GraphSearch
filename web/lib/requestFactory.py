# Request factory to create Eutils requests

import eutilsConfig as cfg
from utils.logger import LogHandler
log = LogHandler.get_logger('__name__', 'forceLog.log')

    
def createSearchRequest(requestType, userInput):
    for cls in SearchRequest.__subclasses__():
        if cls.isRequestType(requestType):
            msg = '{0}: Creating request'
            log.info(msg.format(cls.__name__))
            return cls(userInput) 


class SearchRequest(object):
    '''Base class for search requests'''
   
    @classmethod
    def isRequestTypeFullTextSearch(cls, requestType):
        return requestType == cfg.REQUEST_TYPE_FULLTEXT_SEARCH
    
    @classmethod
    def isRequestTypeSummary(cls, requestType):
        return requestType == cfg.REQUEST_TYPE_SUMMARY        


class RequestFullTextSearch(SearchRequest):
    '''Class for fulltext search requests'''

    isRequestType = SearchRequest.isRequestTypeFullTextSearch
    
    def __init__(self, userInput):
        self.userInput = userInput
