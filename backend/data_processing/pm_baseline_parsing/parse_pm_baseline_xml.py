import os, sys, inspect
import xml.etree.ElementTree as ET
import pandas as pd
import json
import gzip

currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 

import gs_logging
from collections import Counter

class PM_baseline_parsing():
    '''
    Parse all Pubmed Central XML files in a directory.
    '''
    
    def __init__(self, path_lst, outpath):
        '''
        Args:
        dirpath: path to directory containing XML files
        outpath: path to file to write parsed table into
        '''
        self.path_lst = path_lst
        self.outpath = outpath
        self.lh = gs_logging.get_logger()
        
    def parse(self):
        '''
        Actually parse the files
        '''
        ref_stats = []
        num_article = 0
        self.lh.info('Parsing to output file: {f}'.format(f=str(self.outpath)))
        
        for path in self.path_lst:
            num_article += 1
            xml_obj = PM_baseline_XML(path, self.outpath)
            xml_obj.extract_refs()
            #xml_obj.to_file(self.outpath)
            #ref_stats.extend(xml_obj.ref_stats)
            
            self.lh.info('Parsed PMC XML file at path: {f}'.format(f=str(path)))
    
        
class PM_baseline_XML():
    
    def __init__(self, xml_path, outpath):
        '''
        Args:
        fpath: path to PMC XML file
        '''
        self.xml_path = xml_path
        self.outpath = outpath
        if '.gz' in xml_path:
            fhandle = gzip.open(xml_path,'rb')
        else:
            fhandle = xml_path
        self.tree = ET.ElementTree(file=fhandle)
        self.lh = gs_logging.get_logger()
        self.article_stats = {}
        self.ref_stats = []
    
    def extract_refs(self):
        
        for pub in self.tree.iter('PubmedArticle'):
            pub_dict = {'pmid':'', 'doi':'', 'title':'', 'year':'', 'month':'', 'authors':[]}

            for id_lst in pub.iter('ArticleIdList'):
                for article_id in id_lst.iter('ArticleId'):
                    if article_id.attrib['IdType'] == 'pubmed':
                        pub_dict['pmid'] = int(article_id.text)
                    if article_id.attrib['IdType'] == 'doi':
                        pub_dict['doi'] = article_id.text
            
            for article in pub.iter('Article'):
                for title in article.iter('ArticleTitle'):
                    pub_dict['title'] = title.text
            
                for journal in article.iter('Journal'):
                    for journal_info in journal.iter():
                        if journal_info.tag == 'Title':
                            pub_dict['journal'] = journal_info.text
                        if journal_info.tag == 'ISOAbbreviation':
                            pub_dict['journal_iso'] = journal_info.text
                    
                for date in article.iter('PubDate'):
                    for date_item in date.iter():
                        if date_item.tag == 'Year':
                            pub_dict['year'] = int(date_item.text)
                        if date_item.tag == 'Month':
                            pub_dict['month'] = date_item.text
                            
                # Loop through electronic IDs if no DOI found otherwise
                if pub_dict['doi'] == '':
                    for e_id in article.iter('ELocationID'):
                        if e_id.attrib['EIdType'] == 'doi':
                            pub_dict['doi'] = e_id.text

                for authors in article.iter('Author'):
                    new_author = {'first':'', 'last':''}
                    for author_name in authors.iter():
                        if author_name.tag == 'ForeName':
                            new_author['first'] = author_name.text
                        if author_name.tag == 'LastName':
                            new_author['last'] = author_name.text
                    pub_dict['authors'].append(new_author)
                    
            self.lh.info('Parsed article: {a}'.format(a=str(pub_dict['pmid'])))
            self.to_file(pub_dict)
    
    def to_file(self, out_dict):
        '''
        Appends output dictionary to a file on disk.
        '''
        
        out_dict['source_xml'] = self.xml_path
        
        with open(self.outpath, 'a') as fp:
            json.dump(out_dict, fp)
            fp.write('\n')
        