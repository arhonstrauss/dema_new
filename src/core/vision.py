import base64
from typing import List, Dict, Any, Optional
import os

from dotenv import load_dotenv
from openai import OpenAI
from loguru import logger


class VisionAnalyzer:
    """Handles interaction with GPT-4V for screenshot analysis"""
    
    def __init__(self, api_key: Optional[str] = None):
        if not api_key:
            api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key is required")
        
        logger.info("Initializing VisionAnalyzer")
        self.client = OpenAI(api_key=api_key)
        
    def _encode_image(self, image_path: str) -> str:
        """Encode image to base64"""
        logger.debug(f"Encoding image: {image_path}")
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def analyze_screenshot(
        self,
        screenshot_path: str,
        objective: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """Analyze a screenshot using GPT-4o"""
        try:
            with open(screenshot_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            system_message = (
                "You are an expert web analyst helping to explore a website. "
                "Your task is to analyze screenshots and identify the most relevant elements "
                "to interact with based on the exploration objective. "
                "\n\nFor each interaction you suggest, you must specify either:\n"
                "1. For clickable elements (buttons, links, etc.):\n"
                "   text: 'exact text content'\n"
                "   type: button\n"
                "   reason: why this interaction is relevant\n"
                "\n2. For input fields:\n"
                "   input_field: 'placeholder or label text'\n"
                "   input_value: 'what to type'\n"
                "   reason: why this input is needed\n"
                "\nIMPORTANT: Always provide the exact text as it appears on the page. "
                "For input fields, specify both what text identifies the field (placeholder/label) "
                "and what value should be entered.\n\n"
                "Example valid responses:\n\n"
                "For a search box:\n"
                "input_field: 'Search...'\n"
                "input_value: 'electric cars'\n"
                "reason: Need to search for electric car content\n\n"
                "For a button:\n"
                "text: 'Sign In'\n"
                "type: button\n"
                "reason: Need to access account features\n\n"
                "For a link:\n"
                "text: 'Read More'\n"
                "type: link\n"
                "reason: Access full article content"
            )
            
            user_message = (
                f"Analyze this screenshot with the objective: {objective}\n\n"
                "First, provide a brief description of what you see on the page.\n\n"
                "Then, list the recommended interactions in order of relevance to our objective. "
                "For each interaction, use EXACTLY one of these formats:\n\n"
                "For clickable elements:\n"
                "text: 'exact button/link text'\n"
                "type: button\n"
                "reason: why click this\n\n"
                "For input fields:\n"
                "input_field: 'placeholder or label text'\n"
                "input_value: 'text to enter'\n"
                "reason: why enter this\n\n"
                "IMPORTANT: Use EXACTLY these formats with these exact field names. "
                "Each interaction must have all fields specified in one of these formats."
            )
            
            if context:
                user_message += "\n\nContext from previous interactions:\n"
                for key, value in context.items():
                    user_message += f"- {key}: {value}\n"
            
            messages = [
                {"role": "system", "content": system_message},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_message},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=1000
            )
            
            analysis = response.choices[0].message.content
            logger.info("Received analysis from GPT-4o")
            logger.debug(f"Raw GPT-4o response:\n{analysis}")
            
            return {
                "analysis": analysis,
                "screenshot_path": screenshot_path,
                "objective": objective,
                "context": context or {}
            }
            
        except Exception as e:
            logger.error(f"Error analyzing screenshot: {str(e)}")
            return {
                "error": str(e),
                "screenshot_path": screenshot_path
            }
    
    def extract_interaction_targets(self, analysis: str) -> List[Dict[str, str]]:
        """Extract interaction targets from the analysis text"""
        logger.info("Extracting interaction targets from analysis")
        targets = []
        current_target = {}
        
        # Split into lines and process
        analysis_lines = analysis.split('\n')
        in_recommended_section = False
        in_interaction = False
        
        for line in analysis_lines:
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue
            
            # Check if we're in the recommended interactions section
            if "### Recommended Interactions" in line:
                in_recommended_section = True
                continue
                
            if not in_recommended_section:
                continue
                
            # Check for start of a new interaction (numbered list with header)
            if line.strip().startswith(('1.', '2.', '3.', '4.')) and "**" in line:
                if current_target:
                    if len(current_target) >= 2:  # Ensure we have at least text and type
                        targets.append(current_target)
                current_target = {}
                in_interaction = True
                continue
            
            # Only process lines that start with a dash and are part of an interaction
            if in_interaction and line.strip().startswith('-'):
                # Remove the dash and whitespace
                line = line.strip('- ')
                
                if ':' not in line:
                    continue
                    
                # Split only on the first colon
                parts = line.split(':', 1)
                if len(parts) != 2:
                    continue
                    
                key = parts[0].strip().lower()
                # Remove both single and double quotes from the value
                value = parts[1].strip().strip("'").strip('"')
                
                if key == 'text':
                    current_target['text'] = value
                    current_target['element_type'] = 'button'  # Default to button, may be overridden
                elif key == 'input_field':
                    current_target['text'] = value
                    current_target['element_type'] = 'input'
                    current_target['is_input'] = True
                elif key == 'input_value':
                    current_target['value'] = value
                elif key == 'type':
                    current_target['element_type'] = value.lower()
                elif key == 'reason':
                    current_target['reason'] = value
            
            # If we hit a new section header, we're done with interactions
            elif line.startswith('###'):
                in_recommended_section = False
                if current_target and len(current_target) >= 2:
                    targets.append(current_target)
                break
        
        # Add the last target if it exists
        if current_target and len(current_target) >= 2:
            targets.append(current_target)
        
        logger.info(f"Extracted {len(targets)} interaction targets")
        logger.debug(f"Extracted targets: {targets}")
        return targets