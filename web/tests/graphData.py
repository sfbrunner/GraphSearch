# Test for graph data functionality

import unittest
import json 
from context import lib
from lib import ResultGraph as rg

class GraphDataTest(unittest.TestCase):

    def testGraphData(self):
        citations = json.loads(open('messages/dataFetchTest.json', 'r').read())
        resultGraph = rg.ResultGraph()
        resultGraph.populate_from_cite_dict(citations)
        result = resultGraph.get_json()
        print result
        self.assertNotEqual(result, None)

if __name__ == "__main__":
    unittest.main(exit = False)  