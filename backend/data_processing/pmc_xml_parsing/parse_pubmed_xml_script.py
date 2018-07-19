#!/nfs/users/nfs_s/sb50/bin/anaconda2/bin/python

import argparse
import sys, os, inspect
sys.path.append('..')
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 

import gs_logging
from math import ceil
import parse_pubmed_xml

parser = argparse.ArgumentParser(description='Parser for NCBI PMC XML documents.')
parser.add_argument('-i','--input_dir',help='Input directory containing directories with XML files',required=True)
parser.add_argument('-o','--output_dir',help='Output directory',required=True)
parser.add_argument('-j','--job_id',help='Job index',required=False, default = '')
parser.add_argument('-m','--max_jobs',help='Maximum number of jobs',required=False, default = 10)


if __name__ == '__main__':
    args = parser.parse_args()
    
    # Define job directory
    job_dir = os.path.join(args.output_dir, 'job_'+str(args.job_id))
    
    # Initialise logging
    lh = gs_logging.get_logger(log_name = 'PMC XML parsing job '+str(args.job_id), fpath = os.path.join(args.output_dir, 'log_' + args.job_id + '.log'))
    
    # Load list of all available folders
    folders = os.listdir(args.input_dir)
    
    # Determine which folders to process based on the supplied array ID
    num_to_process = int(ceil(len(folders)/args.max_jobs))
    idx_start = (int(args.job_id)-1)*num_to_process+1
    idx_stop  = int(int(args.job_id)*num_to_process)+1
    
    if idx_stop > len(folders):
        idx_stop = int(len(folders))
    
    folder_idx = range(idx_start, idx_stop)
    
    # Process folders
    out_file = os.path.join(args.output_dir, 'parsed_xml_' + args.job_id + '.csv')
    for i in range(idx_start, idx_stop):
        lh.info('Parsing directory with index {x} (starting at: {s}, ending at: {e})'.format(x=str(i), 
                                                                                             s=str(idx_start), e=str(idx_stop)))
        this_folder = os.path.join(args.input_dir, folders[i])
        lh.info('Directory name: {n}'.format(n = str(this_folder)))
        PMC_Dir = parse_pubmed_xml.PMC_Dir(dirpath=this_folder, outpath=out_file)
        PMC_Dir.parse()