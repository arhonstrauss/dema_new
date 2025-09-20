import uuid
from typing import Optional, Dict, Any
from datetime import datetime
import time
import os

from loguru import logger

from src.core.browser import Browser
from src.core.vision import VisionAnalyzer
from src.models.workflow import Workflow
from src.models.interaction import Interaction, InteractionType


class GPTGuidedExplorer:
    """Explores a website using GPT-4V for guidance"""
    
    def __init__(
        self,
        browser: Browser,
        vision_analyzer: VisionAnalyzer,
        workflow: Workflow,
        max_steps: int = 50,
        screenshot_dir: str = ""
    ):
        logger.info("Initializing GPTGuidedExplorer")
        self.browser = browser
        self.vision_analyzer = vision_analyzer
        self.workflow = workflow
        self.max_steps = max_steps
        self.screenshot_dir = screenshot_dir
        self.steps_taken = 0
    
    async def explore(self, url, objective):
        """
        Explore a website starting from the given URL
        """
        logger.info(f"Starting exploration of {url}")
        
        try:
            # Initialize browser and visit URL
            self.browser.navigate_to(url)
            time.sleep(2)  # Initial load wait
            
            # Take screenshot
            screenshot_path = os.path.join(self.screenshot_dir, "current.png")
            if not self.browser.take_screenshot(screenshot_path):
                logger.error("Failed to take screenshot, aborting exploration")
                return None  # Abort if screenshot fails
            
            # Get current context
            context = {
                "url": url,
                "title": self.browser.get_title()
            }
            
            # Analyze screenshot
            analysis = self.vision_analyzer.analyze_screenshot(
                screenshot_path,
                objective,
                context
            )
            
            if "error" in analysis:
                logger.error(f"Vision analysis failed: {analysis['error']}")
                return None  # Return None if analysis fails
            
            # Extract interaction targets
            targets = self.vision_analyzer.extract_interaction_targets(analysis["analysis"])
            
            # Interact with targets
            for target in targets:
                try:
                    if target.get("is_input"):
                        self.browser.enter_text(target["text"], target["value"])
                    else:
                        self.browser.click_element(target["text"])
                    time.sleep(1)  # Wait for any page updates
                except Exception as e:
                    logger.error(f"Failed to interact with target {target}: {str(e)}")
                    continue
            
            return self.workflow  # Return the workflow after successful exploration
            
        except Exception as e:
            logger.error(f"Exploration failed: {str(e)}")
            raise
    
    def _try_interactions(self, targets: list[Dict[str, str]]) -> bool:
        """
        Try to interact with elements using the provided targets
        
        Returns:
            bool: True if any interaction was successful
        """
        for i, target in enumerate(targets, 1):
            text = target.get("text")
            if not text:
                logger.warning(f"Target {i} missing text, skipping")
                continue
            
            is_input = target.get('is_input', False)
            element_type = target.get('element_type')
            reason = target.get('reason', 'No reason provided')
            
            logger.info(f"Trying interaction {i}/{len(targets)}")
            if is_input:
                logger.info(f"Input field: '{text}' with value: '{target.get('value')}'")
            else:
                logger.info(f"Clicking: '{text}' ({element_type})")
            logger.debug(f"Reason: {reason}")
            
            success, selector = self.browser.process_interaction(target)
            
            if success:
                # Record the interaction
                interaction = Interaction(
                    id=str(uuid.uuid4()),
                    type=InteractionType.INPUT if is_input else InteractionType.CLICK,
                    timestamp=datetime.now(),
                    url=self.browser.get_current_url(),
                    selector=selector,
                    value=target.get('value') if is_input else None,
                    metadata={
                        "text": text,
                        "element_type": element_type,
                        "reason": reason,
                        "is_input": is_input
                    }
                )
                self.workflow.add_interaction(interaction)
                return True
            
            logger.debug(f"Failed to process interaction for target: {text}")
        
        logger.info("No successful interactions found with any target")
        return False
    
    def _should_continue_exploration(self, analysis: Dict[str, Any]) -> bool:
        """Determine if exploration should continue based on the analysis"""
        # This could be enhanced with more sophisticated logic
        return (
            self.steps_taken < self.max_steps
            and "error" not in analysis
            and analysis.get("analysis", "").strip()
        ) 