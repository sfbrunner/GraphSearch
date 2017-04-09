import unittest
from context import lib
import lib.GraphSession as gs


class DataFetchTest(unittest.TestCase):

    def testResultNotNone(self):
        userInput = "27729734,27785449,25995680"
        self.graphSession = gs.GraphSession()
        result = self.graphSession.getCitationsFromPMIDString(userInput)
        self.assertNotEqual(result, None)

if __name__ == "__main__":
    unittest.main(exit = False)  