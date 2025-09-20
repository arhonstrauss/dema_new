import sys
from loguru import logger


def setup_logging(log_file: str = "navi.log", console_level="DEBUG"):
    """Configure logging for the application"""
    # Remove default handler
    logger.remove()
    
    # Add console handler with color
    logger.add(
        sys.stderr,
        format="<green>{time:HH:mm:ss}</green> | "
               "<level>{level: <8}</level> | "
               "<cyan>{name}:{function}</cyan> | "
               "<level>{message}</level>",
        level=console_level,
        colorize=True
    )
    
    # Add file handler
    logger.add(
        log_file,
        rotation="500 MB",
        retention="10 days",
        compression="zip",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | "
               "{name}:{function}:{line} - {message}",
        level="DEBUG"
    )
    
    logger.debug("Logging initialized") 