import os
from typing import Optional, Tuple, Dict
from datetime import datetime
import uuid
import random
import time

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
from loguru import logger

from .element_finder import ElementFinder


class Browser:
    """A wrapper around Selenium WebDriver with enhanced functionality"""
    
    def __init__(self, screenshots_dir: str = "screenshots", headless: bool = False):
        logger.info("Initializing Browser")
        self.screenshots_dir = screenshots_dir
        os.makedirs(screenshots_dir, exist_ok=True)
        logger.debug(f"Created screenshots directory: {screenshots_dir}")
        
        options = Options()
        if headless:
            logger.info("Running in headless mode")
            options.add_argument("--headless=new")
        
        # Basic Chrome options
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument(f"--window-size=1920,1080")
        
        # Initialize ChromeDriver
        logger.debug("Setting up ChromeDriver")
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        logger.debug("ChromeDriver initialized")
        
        self.element_finder = ElementFinder(self.driver)
        self.action_chains = ActionChains(self.driver)
    
    def _add_random_delay(self, min_delay: float = 0.5, max_delay: float = 2.0):
        """Add a random delay to simulate human behavior"""
        delay = random.uniform(min_delay, max_delay)
        logger.debug(f"Adding random delay: {delay:.2f} seconds")
        time.sleep(delay)
    
    def navigate(self, url: str) -> bool:
        """Navigate to a URL"""
        logger.info(f"Navigating to: {url}")
        try:
            self.driver.get(url)
            self._add_random_delay()
            logger.info("Navigation successful")
            return True
        except WebDriverException as e:
            logger.error(f"Failed to navigate to {url}: {str(e)}")
            return False
    
    def navigate_to(self, url):
        """Navigate to the specified URL"""
        # Assuming you are using a library like Selenium
        self.driver.get(url)
    
    def take_screenshot(self, filepath: str) -> bool:
        """Take a screenshot and save it to the specified filepath"""
        try:
            self.driver.save_screenshot(filepath)
            logger.debug(f"Screenshot saved: {filepath}")
            return True
        except Exception as e:
            logger.error(f"Failed to take screenshot: {str(e)}")
            return False
    
    def process_interaction(self, target: Dict[str, str]) -> Tuple[bool, Optional[str]]:
        """Process an interaction based on the target data from GPT"""
        if target.get('is_input'):
            # Try as input field first
            success, selector = self.find_and_input(target['text'], target['value'])
            if not success:
                # If input field attempt fails, try clicking it
                logger.info(f"Input field not found, trying as clickable element: '{target['text']}'")
                return self.find_and_click(target['text'])
            return success, selector
        else:
            return self.find_and_click(target['text'], target.get('element_type'))
    
    def find_and_click(self, text: str, element_type: Optional[str] = None) -> Tuple[bool, Optional[str]]:
        """Find an element by its text and click it"""
        logger.info(f"Attempting to click element with text: '{text}'")
        if element_type:
            logger.debug(f"Element type: {element_type}")
        
        element, selector = self.element_finder.find_by_text(text, element_type)
        if element:
            try:
                logger.debug(f"Found element with selector: {selector}")
                element.click()
                logger.info("Click successful")
                return True, selector
            except WebDriverException as e:
                logger.error(f"Failed to click element with text '{text}': {str(e)}")
        else:
            logger.warning(f"No element found with text: '{text}'")
        return False, None
    
    def find_and_input(self, text: str, input_value: str) -> Tuple[bool, Optional[str]]:
        """Find an input element and enter text"""
        logger.info(f"Attempting to find input field with text: '{text}'")
        
        # Try finding by placeholder or aria-label first
        element, selector = self.element_finder.find_by_text(text, "input")
        
        # If not found, try finding by label
        if not element:
            logger.debug("Input not found directly, trying to find by label")
            label_element, _ = self.element_finder.find_by_text(text, "label")
            if label_element:
                input_id = label_element.get_attribute("for")
                if input_id:
                    try:
                        logger.debug(f"Found label with for attribute: {input_id}")
                        element = self.driver.find_element(By.ID, input_id)
                        selector = f"#{input_id}"
                    except NoSuchElementException:
                        logger.debug(f"No input found with id: {input_id}")
        
        # If still not found, try finding any input with matching text in various attributes
        if not element:
            logger.debug("Trying broader input field search")
            try:
                # Try various attributes that might contain the text
                xpath = (
                    f"//input[contains(@placeholder, '{text}') or "
                    f"contains(@name, '{text}') or "
                    f"contains(@aria-label, '{text}') or "
                    f"contains(@title, '{text}')]"
                )
                element = self.driver.find_element(By.XPATH, xpath)
                selector = xpath
                logger.debug(f"Found input using broader search: {selector}")
            except NoSuchElementException:
                logger.debug("No input found with broader search")
        
        if element:
            try:
                logger.debug(f"Found input element with selector: {selector}")
                # Check if the element is actually clickable/interactable
                try:
                    element.click()  # Try clicking first to ensure it's interactable
                except WebDriverException:
                    logger.debug("Element not clickable, trying to send keys directly")
                
                element.clear()
                element.send_keys(input_value)
                logger.info(f"Successfully input text: '{input_value}'")
                return True, selector
            except WebDriverException as e:
                logger.error(f"Failed to input text into element with text '{text}': {str(e)}")
        else:
            logger.warning(f"No input element found with text: '{text}'")
        
        return False, None
    
    def get_current_url(self) -> str:
        """Get the current URL"""
        url = self.driver.current_url
        logger.debug(f"Current URL: {url}")
        return url
    
    def scroll(self, pixels: int = None):
        """Scroll the page"""
        if pixels is None:
            logger.debug("Scrolling to bottom of page")
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        else:
            logger.debug(f"Scrolling {pixels} pixels")
            self.driver.execute_script(f"window.scrollBy(0, {pixels});")
    
    def close(self):
        """Close the browser"""
        logger.info("Closing browser")
        try:
            self.driver.quit()
            logger.debug("Browser closed successfully")
        except Exception as e:
            logger.error(f"Failed to close browser: {str(e)}") 
    
    def get_title(self):
        # Implement logic to retrieve the current page title
        return self.driver.title  # Assuming you're using a WebDriver instance