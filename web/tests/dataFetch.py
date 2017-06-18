import unittest
from context import lib
from lib import GraphSession as gs
from lib import ConnectEutils as ce
from context import utils
from utils import helperFunctions as hf
import json


class DataFetchTest(unittest.TestCase):

    '''def testResultNotNone(self):
        #userInput = "27729734,27785449,25995680"
        userInput = "db=pubmed&term=PNAS[ta]+AND+97[vi]"
        self.graphSession = gs.GraphSession()
        result = self.graphSession.get_citations_from_fulltext(userInput)
        self.assertNotEqual(result, None)
        #baseline = json.loads(open('messages/dataFetchTest.json', 'r').read())
        #self.assertTrue(hf.ordered(result) == hf.ordered(baseline))'''
             
    def testESummary(self):
        userInput = "27729734,27785449,25995680"
        self.connectEutils = ce.ConnectEutils()
        print self.connectEutils.get_docsummary_from_idList(userInput.split(','))
    

if __name__ == "__main__":
    unittest.main(exit = False)  