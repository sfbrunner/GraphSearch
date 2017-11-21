import logging

def get_logger(log_name = '', fpath = None):
    '''
    Either returns an already existing log handle from LogHandler class attribute,
    or generates a new Log Handle.
    '''
    
    # Retrieve class attribute from LogHandler
    lh = LogHandler().lh
    
    # If lh is not set, generate new log handler
    if not lh:
        lh = LogHandler.get_logger(log_name, fpath)
        if not fpath:
            lh.warning('No file path specified to store log. Any logging will only be written to stdout.')
        else:
            lh.info('Generated new logger. Writing to file: {f}'.format(f=str(fpath)))
    return lh

class LogHandler():
    '''
    Encapsulates behaviour of creating logging.Logger handles
    '''
    lh = None
    
    @classmethod
    def get_logger(self, log_name, fpath=None, debug=False):
        '''
        Returns a logger handle
        
        Args:
        log_name: name of log, can be __name__
        fpath: path to log file
        '''
        
        # If lh is not set, generate new log handler
        if not LogHandler.lh:
            #print "not lh"
            # Initialise logger
            logger = logging.getLogger(log_name)
            logger.setLevel(logging.DEBUG)

            # Create file handler which logs all messages, including debug level
            if fpath:
                fh = logging.FileHandler(fpath)
                fh.setLevel(logging.DEBUG)

            # Create console handler that only logs at the info level
            ch = logging.StreamHandler()
            if debug:
                ch.setLevel(logging.DEBUG)
            else:
                ch.setLevel(logging.INFO)
                
            # Create formatter and add it to the handlers
            formatter = logging.Formatter(fmt='%(asctime)s [%(levelname)s]: %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
            if fpath:
                fh.setFormatter(formatter)
            ch.setFormatter(formatter)

            # Add the handlers to the logger
            if fpath:
                logger.addHandler(fh)
            logger.addHandler(ch)
            
            LogHandler.lh = logger
        
        return LogHandler.lh