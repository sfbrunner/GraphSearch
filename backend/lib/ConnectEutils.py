import requests
import untangle
import pprint

import xml.etree.ElementTree as ET
import requests 
import urllib2
import eutilsConfig as cfg
from decorators import singleton
from utils.logger import LogHandler
log = LogHandler.get_logger('__name__', 'forceLog.log')


@singleton
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
    
    def get_cited_PMID_etree(self, PMID):
        """
        input: PMID as string
        output: list of PMIDs of cited papers
        """
        
        # Parse the Eutils XML as an element tree
        tree = ET.ElementTree(file=urllib2.urlopen('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id='+PMID))
        
        # Iterate through element tree to identify tags specifying PMIDs
        pmid_lst = []
        for element in tree.iter():
            if element.tag == 'pub-id':
                if element.attrib['pub-id-type'] == 'pmid':
                    pmid_lst.append(element.text)
                    
        return pmid_lst
    
    def get_cited_PMID_elink(self, PMID):
        #search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pubmed_refs&id=" + PMID + "&tool=GraphSearch"
        search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pmc_pmc_cites&id=" + PMID + "&tool=GraphSearch"
        msg = '{0}: Connecting to eutils API:\n {1}'
        log.info(msg.format(self.__class__.__name__, search_url))
        
        # Parse the Eutils XML as an element tree
        tree = ET.ElementTree(file=urllib2.urlopen(search_url))
        
        # Iterate through element tree to identify tags specifying PMIDs
        pmid_lst = []
        for element in tree.iter('LinkSetDb'):
            for link in element.iter('Link'):
                for id in link.iter('Id'):
                    pmid_lst.append(id.text)
        
        return pmid_lst

    def get_pmid_from_PMC(self, PMC_ID):
        PMC_ID = PMC_ID.replace('PMC','')
        search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&id=" + PMC_ID
            
        # Parse the Eutils XML as an element tree
        tree = ET.ElementTree(file=urllib2.urlopen(search_url))
        pmid = None
        for element in tree.iter():
            if element.tag == 'Item':
                if 'Name' in element.attrib:
                    if element.attrib['Name'] == 'pmid':
                        pmid = element.text
        return pmid

    def get_cited_pub(self, pub_id):
	#if 'PMC' in pub_id:
	#pub_id = self.get_pmid_from_PMC(pub_id)	    
	
        pmid_lst = self.get_cited_PMID_elink(pub_id)
        return pmid_lst
    
    
    def get_pmid_from_fulltext(self, fulltext):
        """
        input: search string fulltext
        output: list of pmc ids queried from pmc database
        """
        searchResult = []
        search_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&sort=relevance&term=' + fulltext
        msg = '{0}: Connecting to eutils API:\n {1}'
        log.info(msg.format(self.__class__.__name__, search_url))
        # Parse the Eutils XML as an element tree
        root = ET.ElementTree(file=urllib2.urlopen(search_url))
        counter = 0
        for idList in root.iter('IdList'):
            for id in idList.iter('Id'):
                if counter >= 3: # Search results limited to this value
                    break
                msg = '{0}: Search result returned id {1}'
                log.info(msg.format(self.__class__.__name__, id.text))
                searchResult.append(id.text)
                counter += 1
        return searchResult
        
    def get_docsummary_from_idList(self, idList):
        search_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&id=' + ','.join(idList)
        print search_url
        resultList = []
        # Parse the Eutils XML as an element tree
        root = ET.ElementTree(file=urllib2.urlopen(search_url))
        for docSum in root.iter('DocSum'):
            summaryDict = {}
            for element in docSum:
                if element.tag in ('Id',):
                    summaryDict['Id'] = element.text
                elif element.tag in ('Item',):
                    if element.attrib['Name'] in ('Title',):
                        summaryDict['Title'] = element.text
                        
                    elif element.attrib['Name'] in ('AuthorList',):
                        authors = []
                        for author in element:
                            authors.append(author.text)
                        summaryDict['Authors'] = authors
                        
                    elif element.attrib['Name'] in ('PubDate',):
                        summaryDict['PubDate'] = element.text
                        
                    elif element.attrib['Name'] in ('FullJournalName',):
                        summaryDict['Journal'] = element.text  
            resultList.append(summaryDict)
            
        return resultList
