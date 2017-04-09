from ConnectEutils import ConnectEutils as ce
from MongoSession import MongoSession as ms

class GraphSession():

    @staticmethod
    def parseInput(userInput): #check user input with regex?
        return [pmid.strip() for pmid in userInput.split(',')]

    @staticmethod
    def loadCitations(pmidList):
        mongoSession = ms.fromConnectionString()
        citationDict = {}
        for pmid in pmidList:
            # TODO: Check if db rec exists while data  is entered
            mongoCursor = mongoSession.findPublicationByPMID(pmid)
            if mongoCursor:
                citationDict[pmid] = mongoCursor['citations']
            else:
                citationDict[pmid] = ce.get_cited_pub(pmid)
                mongoSession.insertPublication({"pmid" : pmid, "citations" : cite_dict[pmid]})
        return citationDict

    @staticmethod
    def getCitationsFromPMIDString(rawUserInput):
        return GraphSession.loadCitations(GraphSession.parseInput(rawUserInput))