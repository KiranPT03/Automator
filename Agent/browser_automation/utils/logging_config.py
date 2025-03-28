"""
Logging configuration for the browser automation project.
"""
import os
import logging
from logging.handlers import RotatingFileHandler
import sys
from datetime import datetime

def setup_logging(log_level=logging.INFO):
    """
    Set up logging configuration for the application.
    
    Args:
        log_level: The logging level to use
    
    Returns:
        Logger: Configured logger instance
    """
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Create a unique log file name with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(log_dir, f'browser_automation_{timestamp}.log')
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # Clear any existing handlers
    if logger.handlers:
        logger.handlers.clear()
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_format)
    
    # Create file handler
    file_handler = RotatingFileHandler(
        log_file, 
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(log_level)
    file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_format)
    
    # Add handlers to logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger

def get_logger(name):
    """
    Get a logger with the specified name.
    
    Args:
        name: Name for the logger
        
    Returns:
        Logger: Logger instance
    """
    return logging.getLogger(name)