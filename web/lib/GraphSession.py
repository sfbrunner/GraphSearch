from ConnectEutils import ConnectEutils as ce
from MongoSession import MongoSession as ms

class GraphSession():

    def __init__(self):
        self.mongoSession = ms.fromConnectionString()

    @staticmethod
    def parseInput(userInput): #check user input with regex?
        return [pmid.strip() for pmid in userInput.split(',')]

    def loadCitations(self, pmidList):
        citationDict = {}
        for pmid in pmidList:
            # TODO: Check if db rec exists while data  is entered
            mongoCursor = self.mongoSession.findPublicationByPMID(pmid)
            if mongoCursor:
                citationDict[pmid] = mongoCursor['citations']
            else:
                citationDict[pmid] = ce.get_cited_pub(pmid)
                self.mongoSession.insertPublication({"pmid" : pmid, "citations" : cite_dict[pmid]})
        return citationDict

    def getCitationsFromPMIDString(self, rawUserInput):
        return self.loadCitations(GraphSession.parseInput(rawUserInput))