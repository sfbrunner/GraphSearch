#!/anaconda2/bin/python
import sys, os, argparse
sys.path.append('..')
sys.path.append('../lib')
#sys.path.append('../data_processing')
from utils.logger import LogHandler
from dataLoader import pubmedLoader

parser = argparse.ArgumentParser(description='Script to download and process Pubmed daily update files.')
parser.add_argument('-d','--download_dir',help='Directory to store downloads',required=True)
parser.add_argument('-p','--processed_dir',help='Directory to store processed files',required=True)

if __name__ == '__main__':
    args = parser.parse_args()

    print 'requesting logger'
    log = LogHandler.get_logger('__name__', fpath='../logs/update_pubmed.log')
    LogHandler.format_logger(log, fpath='../logs/update_pubmed.log')

    log.info('Starting Pubmed daily update.')
    pubmed_loader = pubmedLoader(local_data_dir=args.download_dir, 
                                 local_proc_dir=args.processed_dir)

    log.info('Retrieving FTP files.')
    try:
        pm_update_files = pubmed_loader.get_ftp_files()
    except:
        log.exception('Encountered exception while fetching FTP file infos.')

    log.info('Generating database injection dictionary.')
    try:
        update_dict, pm_fid_lst = pubmed_loader.generate_injection_dict(pm_update_files)
    except:
        log.exception('Encountered exception while generating Pubmed update file dictionary.')

    log.info('Injecting FTP file infos into DB.')
    try:
        pubmed_loader.inject_new_files(update_dict, pm_fid_lst)
    except:
        log.exception('Encountered exception while injecting file info into MongoDB.')

    log.info('Downloading and processing new files.')
    try:
        print 'file processing'
        #pubmed_loader.process_new_files()
    except:
        log.exception('Encountered exception while processing daily update Pubmed file.')