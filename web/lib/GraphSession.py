from ConnectEutils import ConnectEutils

class GraphSession():

    def __init__(self, user_input):
        self.user_input = user_input
        self.eutils = ConnectEutils()

    def parse_input(self):
        pmid_lst_raw = self.user_input.split(',')
	self.pmid_lst=[]
	for pmid in pmid_lst_raw:
	    pmid = pmid.strip()
            self.pmid_lst.append(pmid)

    def load_citations(self):
        cite_dict = {}
        for pmid in self.pmid_lst:
            cite_dict[pmid] = self.eutils.get_cited_pub(pmid)

        self.cite_dict = cite_dict
             
             
