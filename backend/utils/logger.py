import logging

class LogHandler():
    '''
    Encapsulates behaviour of creatig logging.Logger handles
    '''
    
    @classmethod
    def get_logger(self, log_name, fpath):
        '''
        Returns a logger handle
        
        Args:
        log_name: name of log, can be __name__
        fpath: path to log file
        '''
        
        # Initialise logger
        logger = logging.getLogger(log_name)
        logger.setLevel(logging.DEBUG)
        
        # Create file handler which logs all messages, including debug level
        fh = logging.FileHandler(fpath)
        fh.setLevel(logging.DEBUG)
        
        # Create console handler that only logs at the info level
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        
        # Create formatter and add it to the handlers
        formatter = logging.Formatter(fmt='%(asctime)s [%(levelname)s]: %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
        fh.setFormatter(formatter)
        ch.setFormatter(formatter)
        
        # Add the handlers to the logger
        logger.addHandler(fh)
        logger.addHandler(ch)
        
        return logger