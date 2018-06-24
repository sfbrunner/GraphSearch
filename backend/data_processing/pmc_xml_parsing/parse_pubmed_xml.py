import os, sys, inspect
import xml.etree.ElementTree as ET
import pandas as pd
sys.path.append('..')
from collections import Counter
import traceback

currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 

import gs_logging

class PMC_Dir():
    '''
    Parse all Pubmed Central XML files in a directory.
    '''
    
    def __init__(self, dirpath, outpath):
        '''
        Args:
        dirpath: path to directory containing XML files
        outpath: path to file to write parsed table into
        '''
        self.dirpath = dirpath
        self.outpath = outpath
        self.lh = gs_logging.get_logger()
        
    def parse(self):
        '''
        Actually parse the files
        '''
        ref_stats = []
        num_article = 0
        for path in os.listdir(self.dirpath):
            num_article += 1
            xml_path = os.path.join(self.dirpath, path)
            self.lh.info('Parsing file {f}'.format(f=str(xml_path)))
            try:
                xml_obj = PMC_XML(xml_path)
                xml_obj.to_file(self.outpath)
                ref_stats.extend(xml_obj.ref_stats)
            except:
                traceback.print_exc()
                self.lh.exception('Encountered ParseError')
                
        
        # Summarise reference stats
        self.lh.info('Parsed PMC XML files in directory: {f}'.format(f=str(self.dirpath)))
        self.lh.info('Output directory: {f}'.format(f=str(self.outpath)))
        self.lh.info('Total number of XML files: {n}'.format(n=str(num_article)))
        self.lh.info('Summary of included reference types:')
        self.lh.info(Counter(ref_stats))
    
        
class PMC_XML():
    
    def __init__(self, fpath):
        '''
        Args:
        fpath: path to PMC XML file
        '''
        self.lh = gs_logging.get_logger()
        
        try:
            self.tree = ET.ElementTree(file=fpath)
        except:
            self.lh.exception('Encountered error during call to ET.ElementTree.')
        
        self.article_stats = {}
        self.ref_stats = []
        
    def extract_to_table(self):
        '''
        Returns a Pandas dataframe containing all relevant article information
        '''
        dict_lst = self.extract_refs()
        article_id = self.extract_article_id()
        self.article_stats = article_id
        
        tbl = pd.DataFrame(dict_lst)
        tbl['article_pmid'] = article_id['pmid']
        tbl['article_pmc'] = article_id['pmc']
        tbl['article_doi'] = article_id['doi']
        
        self.tbl = tbl
        return tbl
    
    def extract_article_id(self):
        '''
        Returns the ID of the article itself.
        '''
        article_dict = {'pmid':None, 'pmc':None, 'doi':None}
        
        for article_id in self.tree.iter('article-id'):
            if 'pub-id-type' not in article_id.attrib.keys():
                continue
            if article_id.attrib['pub-id-type'] == 'pmid':
                article_dict['pmid'] = article_id.text
            if article_id.attrib['pub-id-type'] == 'pmc':
                article_dict['pmc'] = article_id.text
            if article_id.attrib['pub-id-type'] == 'doi':
                article_dict['doi'] = article_id.text
        return article_dict
    
    def extract_refs(self):
        '''
        Extracts all references contained in the XML file.
        '''
        refs = []
        
        for ref in self.tree.iter('ref'):
            pmid = False
            doi = False
            
            for pub in ref.iter('pub-id'):
                if 'pub-id-type' not in pub.attrib.keys():
                    continue
                if pub.attrib['pub-id-type'] == 'pmid':
                    pmid = pub.text
                elif pub.attrib['pub-id-type'] == 'doi':
                    doi = pub.text
                else:
                    self.ref_stats.append(pub.attrib['pub-id-type'])
            if pmid:
                ref_dict = {'type':'pmid', 'ref_id':pmid}
                self.ref_stats.append('pmid')
            elif doi:
                ref_dict = {'type':'doi', 'ref_id':doi}
                self.ref_stats.append('doi')
            else:
                continue
            refs.append(ref_dict)
                
        return refs
    
    def to_file(self, fpath):
        '''
        Appends output table to a file on disk.
        '''
        # Make sure the output table actually exists.
        try:
            self.extract_to_table()
            
            # If file does not exist, write header
            if not os.path.isfile(fpath):
                with open(fpath, 'a') as f:
                    f.write(','.join(self.tbl.columns))
                    f.write('\n')
            self.tbl.to_csv(fpath, index=False, mode='a', header=False, encoding='utf-8')
        except:
            self.lh.exception('Encountered ParseError')
        