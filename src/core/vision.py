import base64
import requests
from typing import List, Dict, Any, Optional
import os

from dotenv import load_dotenv
from loguru import logger


class VisionAnalyzer:
    def __init__(self, api_key: Optional[str] = None):
        if not api_key:
            api_key = os.getenv('XAI_API_KEY')
        if not api_key:
            raise ValueError('xAI API key is required')
        
        logger.info('Initializing VisionAnalyzer with xAI')
        self.api_key = api_key
        self.base_url = 'https://api.x.ai/v1'
        
    def _encode_image(self, image_path: str) -> str:
        logger.debug(f'Encoding image: {image_path}')
        with open(image_path, 'rb') as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def analyze_screenshot(self, screenshot_path: str, objective: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
        try:
            with open(screenshot_path, 'rb') as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            system_message = 'You are an expert web analyst helping to explore a website.'
            user_message = f'Analyze this screenshot with the objective: {objective}'
            
            payload = {
                'model': 'grok-2-vision-1212',
                'messages': [
                    {'role': 'system', 'content': system_message},
                    {
                        'role': 'user',
                        'content': [
                            {'type': 'text', 'text': user_message},
                            {
                                'type': 'image_url',
                                'image_url': {
                                    'url': f'data:image/jpeg;base64,{base64_image}'
                                }
                            }
                        ]
                    }
                ],
                'max_tokens': 1000
            }
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(f'{self.base_url}/chat/completions', headers=headers, json=payload)
            
            if response.status_code != 200:
                raise Exception(f'xAI API error: {response.status_code} - {response.text}')
            
            response_data = response.json()
            analysis = response_data['choices'][0]['message']['content']
            
            logger.info('Received analysis from xAI Grok Vision')
            logger.debug(f'Raw xAI response: {analysis}')
            
            return {
                'analysis': analysis,
                'screenshot_path': screenshot_path,
                'objective': objective,
                'context': context or {}
            }
            
        except Exception as e:
            logger.error(f'Error analyzing screenshot: {str(e)}')
            return {
                'error': str(e),
                'screenshot_path': screenshot_path
            }
    
    def extract_interaction_targets(self, analysis: str) -> List[Dict[str, str]]:
        logger.info('Extracting interaction targets from analysis')
        targets = []
        return targets
