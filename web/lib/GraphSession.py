from ConnectEutils import ConnectEutils

class GraphSession():

    def __init__(self, user_input):
        self.user_input = user_input
        self.eutils = ConnectEutils()

    def parse_input(self):
        self.pmid_lst = self.user_input.split(',')

    def load_citations(self):
        cite_dict = {}
        for pmid in self.pmid_lst:
            cite_dict[pmid] = self.eutils.get_cited_PMID_elink(pmid)

        self.cite_dict = cite_dict
             
             
