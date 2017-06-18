import ConnectEutils as ce
from MongoSession import MongoSession as ms

class GraphSession():

    @staticmethod
    def parseInput(userInput): #check user input with regex?
        return [pmid.strip() for pmid in userInput.split(',')]

    @staticmethod
    def parse_full_text_input(user_input):
        return user_input.replace(' ','+')
        
        
    @staticmethod
    def loadCitations(pmidList):
        eutils = ce.ConnectEutils()
        mongoSession = ms.fromConnectionString()
        citationDict = {}
        #from IPython.core.debugger import Tracer; Tracer()()
        for pmid in pmidList:
            # TODO: Check if db rec exists while data  is entered
            mongoCursor = mongoSession.findPublicationByPMID(pmid)
            if 0==1:#mongoCursor:
                citationDict[pmid] = mongoCursor['citations']
            else:
                citationDict[pmid] = eutils.get_cited_pub(pmid)
                mongoSession.insertPublication({"pmid" : pmid, "citations" : citationDict[pmid]})
        return citationDict

    @staticmethod
    def getCitationsFromPMIDString(rawUserInput):
        return GraphSession.loadCitations(GraphSession.parseInput(rawUserInput))
        
    def get_citations_from_fulltext(self, fulltext):
        parsed_input = GraphSession.parse_full_text_input(fulltext)
        eutils = ce.ConnectEutils()
        return GraphSession.loadCitations(eutils.get_pmid_from_fulltext(parsed_input))
        
    def get_metadataList_from_idList(self, idList):
        eutils = ce.ConnectEutils()
        return eutils.get_docsummary_from_idList(idList)

