import ftplib
import sys, os, datetime
sys.path.append('..')
sys.path.append('../data_processing/pm_baseline_parsing')
from utils.logger import LogHandler
from MongoSession import MongoSession
#print os.getcwd()
from parse_pm_baseline_xml import PM_baseline_XML

class pubmedLoader(object):

    def __init__(self, ftp_url='ftp.ncbi.nlm.nih.gov', ftp_dir='pubmed/updatefiles', 
                        local_data_dir='downloads', local_proc_dir='processed'):
        # Initialise params
        self.ftp_url = ftp_url
        self.ftp_dir = ftp_dir
        self.local_data_dir = local_data_dir
        self.local_proc_dir = local_proc_dir

        # Initialise mongodb connxn
        self.mongo = MongoSession.fromConnectionString()
        self.db = self.mongo.client.GraphSearch
        self.collxn = self.db.import_pubmed

        global log 
        log = LogHandler.get_logger('__name__')

    def get_ftp_files(self):

        # Open ftp connxn
        ftp = ftplib.FTP(self.ftp_url)

        ftp.login()
        ftp.cwd(self.ftp_dir)
        pm_update_files = []

        try:
            pm_update_files = ftp.nlst()
        except ftplib.error_perm, resp:
            if str(resp) == "550 No files found":
                log.info("No files in FTP directory {d}".format(d=self.ftp_dir))
            else:
                log.info('Error during listing of FTP directory {d}'.format(d=self.ftp_dir))
            return False

        return pm_update_files

    def generate_injection_dict(self, pm_update_files):

        update_dict = []
        pm_fid_lst = []
        for update_file in pm_update_files:
            if 'xml' in update_file:
                if 'md5' not in update_file:
                    this_id = update_file.split('n')[1].split('.')[0]
                    this_collection = update_file.split('n')[0]
                    this_dict = {'file_name': update_file, 
                                'file_id': this_id, 
                                'pm_collection': this_collection,
                                'downloaded':0,
                                'creationdate': datetime.datetime.utcnow()}
                    update_dict.append(this_dict)
                    pm_fid_lst.append(this_id)
        
        return update_dict, pm_fid_lst

    def inject_new_files(self, update_dict, pm_fid_lst):

        contained_files = self.collxn.find({"file_id":{"$in":pm_fid_lst}})

        retrieved_id = []
        for doc in contained_files:
            retrieved_id.append(doc['file_id'])

        insert_dict = []
        for doc in update_dict:
            if doc['file_id'] not in retrieved_id:
                insert_dict.append(doc)
        if insert_dict:
            self.collxn.insert_many(insert_dict)
        else:
            log.info('No new files identified versus Pubmed info storage.')
    
    def mark_file_downloaded(self, file_name):
        self.collxn.findAndModify({"query": { "file_name": file_name}, "update": { "$set": {"downloaded":1}}})

    def process_new_files(self):
        not_downloaded = self.collxn.find({'downloaded':0})

        to_download = []
        for doc in not_downloaded:
            to_download.append(doc['file_name'])

        # Download and process
        ftp = ftplib.FTP(self.ftp_url)
        ftp.login()
        ftp.cwd(self.ftp_dir)

        for update_file in to_download:
            dl_file = os.path.join(self.local_data_dir, update_file)
            proc_file = os.path.join(self.local_proc_dir, update_file+'.csv')
            
            log.info('Downloading file {f}'.format(f=update_file))
            with open(dl_file, 'wb') as f:
                ftp.retrbinary('RETR ' + update_file, f.write)
            try:
                log.info('Processing file {f}'.format(f=dl_file))
                xml_obj = PM_baseline_XML(dl_file, proc_file)
                xml_obj.extract_refs()
                log.info('Processing complete.')
                self.mark_file_downloaded(update_file)
            except:
                log.exception('Encountered exception while processing PMC XML file.')