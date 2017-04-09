import unittest
from context import lib
import lib.GraphSession as gs


class dataFetchTest(unittest.TestCase):

    def testCheckInsert(self):
        userInput = "27729734,27785449,25995680"
        self.graphSession = gs.GraphSession()
        self.graphSession.getCitationsFromPMIDString(userInput)

if __name__ == "__main__":
    unittest.main(exit = False)  