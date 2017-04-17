import unittest
from context import lib
from lib import GraphSession as gs
from context import utils
from utils import helperFunctions as hf
import json


class DataFetchTest(unittest.TestCase):

    def testResultNotNone(self):
        userInput = "27729734,27785449,25995680"
        self.graphSession = gs.GraphSession()
        result = self.graphSession.getCitationsFromPMIDString(userInput)
        self.assertNotEqual(result, None)
        baseline = json.loads(open('messages/dataFetchTest.json', 'r').read())
        self.assertTrue(hf.ordered(result) == hf.ordered(baseline))

if __name__ == "__main__":
    unittest.main(exit = False)  