import unittest
from context import lib
import lib.MongoSession as mongo


class DatabaseTest(unittest.TestCase):

    def testCheckConnection(self):
        self.mongoSession = mongo.MongoSession.fromConnectionString()

if __name__ == "__main__":
    unittest.main(exit = False)     