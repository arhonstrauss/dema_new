import argparse
from dotenv import load_dotenv
from loguru import logger

from src.core.vision import Grok4TextAnalyzer
from src.utils.config import Config
from src.utils.logging import setup_logging


def print_information_summary(result):
    print('\n=== Grok-4 Information Report ===\n')
    if result.get('success'):
        print(f"Name: {result['name']}")
        print(f"Model: {result['model']}")
        print("\nInformation:")
        print("-" * 50)
        print(result['information'])
        print("-" * 50)
    else:
        print(f"Error querying information about: {result['name']}")
        print(f"Error: {result.get('error', 'Unknown error')}")


def main():
    parser = argparse.ArgumentParser(description='Query Grok-4 for information about a person or entity')
    parser.add_argument('name', help='Name of person or entity to research')
    parser.add_argument('--config', default='.env', help='Path to config file')
    parser.add_argument('--log-level', default='INFO', help='Set the console logging level')
    args = parser.parse_args()
    
    # Load environment variables from the specified config file
    load_dotenv(args.config)
    config = Config.from_env(args.config)
    
    setup_logging(console_level=args.log_level)
    logger.info('Starting Grok-4 information query')
    
    try:
        grok_analyzer = Grok4TextAnalyzer(api_key=config.xai_api_key)
        
        result = grok_analyzer.query_about_name(args.name)
        
        if result.get('success'):
            logger.info('Information query completed successfully')
            print_information_summary(result)
        else:
            logger.error(f'Information query failed: {result.get("error", "Unknown error")}')
            print_information_summary(result)
        
    except Exception as e:
        logger.exception('Information query failed: {}'.format(str(e)))
        raise


if __name__ == '__main__':
    main()
