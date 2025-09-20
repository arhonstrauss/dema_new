import requests
from typing import Dict, Any, Optional
import os

from dotenv import load_dotenv
from loguru import logger


class Grok4TextAnalyzer:
    def __init__(self, api_key: Optional[str] = None):
        if not api_key:
            api_key = os.getenv('XAI_API_KEY')
        if not api_key:
            raise ValueError('xAI API key is required')
        
        logger.info('Initializing Grok4TextAnalyzer with xAI')
        self.api_key = api_key
        self.base_url = 'https://api.x.ai/v1'
        
    def query_about_name(self, name: str) -> Dict[str, Any]:
        """
        Query Grok-4 to find out everything it can about the provided name.
        """
        try:
            system_message = """You are an expert research assistant. When given a name, provide comprehensive information about that person or entity. 
            Include relevant details such as:
            - Who they are (if a person) or what they are (if an entity)
            - Notable achievements, works, or contributions
            - Background information
            - Current status or recent activities
            - Any controversies or notable events associated with them
            - Social media presence or public information
            Be thorough and factual in your response."""
            
            user_message = f"Tell me everything you can find out about: {name}"
            
            payload = {
                'model': 'grok-4',
                'messages': [
                    {'role': 'system', 'content': system_message},
                    {'role': 'user', 'content': user_message}
                ],
                'max_tokens': 2000,
                'temperature': 0.7
            }
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            logger.info(f'Querying Grok-4 about: {name}')
            response = requests.post(f'{self.base_url}/chat/completions', headers=headers, json=payload)
            
            if response.status_code != 200:
                raise Exception(f'xAI API error: {response.status_code} - {response.text}')
            
            response_data = response.json()
            analysis = response_data['choices'][0]['message']['content']
            
            logger.info('Received response from Grok-4')
            logger.debug(f'Raw Grok-4 response: {analysis}')
            
            return {
                'name': name,
                'information': analysis,
                'model': 'grok-4',
                'success': True
            }
            
        except Exception as e:
            logger.error(f'Error querying Grok-4 about {name}: {str(e)}')
            return {
                'name': name,
                'error': str(e),
                'success': False
            }
