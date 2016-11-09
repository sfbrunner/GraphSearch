import requests
import untangle
import pprint

class ConnectEutils():
    '''This class interacts with the Eutils API.
    
    The purpose of the class is to provide basic functionality to query and interact
    with the Eutils API. More about Eutils: http://eutils.ncbi.nlm.nih.gov
    '''
    
    def get_cited_PMID(self, PMID):
        """Fetches all PMIDs that a publication cites as a list.
        
        Args:
            PMID: A string containing the PMID of the publication of interest.
            
        Returns:
            pmid_lst: A list of strings, each being a PMID of a publication that is cited
                    by the 'PMID' publication.
        """

        # Send request to Eutils to receive the entire 'PMID' publication in XML format
        r = requests.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id='+PMID, auth=('user', 'pass'))
        
        # Parse XML using the untangle module
        xmlObj = untangle.parse(r.text)

        # Loop through each citation
        pmid_lst = []

        for ref in xmlObj.pmc_articleset.article.back.ref_list.ref:
            this_cite = ref.citation
            
            # If the citation has a publication id, then analyse further
            if hasattr(this_cite, 'pub_id'):
                pubs = this_cite.pub_id
                
                # Some publications have multiple publication ids, meaning they need to be handled separately
                if type(pubs) == list:
                    for pub_el in pubs:
                        if pub_el['pub-id-type'] == 'pmid':
                            pmid_lst.append(pub_el.cdata)
                elif pubs['pub-id-type'] == 'pmid':
                    pmid_lst.append(pubs.cdata)
        
        return pmid_lst