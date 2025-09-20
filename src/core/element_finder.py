from typing import List, Dict, Optional, Tuple
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import NoSuchElementException
from loguru import logger


class ElementFinder:
    """Smart element finder that tries different strategies to locate elements"""
    
    def __init__(self, driver: WebDriver):
        self.driver = driver
    
    def find_by_text(self, text: str, element_type: Optional[str] = None, location_context: Optional[str] = None) -> Tuple[Optional[WebElement], Optional[str]]:
        """
        Find an element using various text-based strategies
        
        Args:
            text: The visible text to search for
            element_type: Type of element (button, link, etc.)
            location_context: Location context for the element
        
        Returns:
            Tuple of (WebElement if found, selector used to find it)
        """
        logger.info(f"Searching for element with text: '{text}'")
        if element_type:
            logger.info(f"Element type: {element_type}")
        if location_context:
            logger.info(f"Location context: {location_context}")
        
        strategies = [
            # Exact text match strategies
            (By.XPATH, f"//*[normalize-space(text())='{text}']"),
            (By.XPATH, f"//*[contains(text(),'{text}')]"),
            
            # Link specific strategies
            (By.LINK_TEXT, text),
            (By.PARTIAL_LINK_TEXT, text),
            
            # Button specific strategies
            (By.XPATH, f"//button[contains(text(),'{text}')]"),
            (By.XPATH, f"//button[@value='{text}']"),
            (By.XPATH, f"//input[@type='button' and @value='{text}']"),
            (By.XPATH, f"//input[@type='submit' and @value='{text}']"),
            
            # Input specific strategies including placeholder
            (By.XPATH, f"//input[@placeholder='{text}']"),
            (By.XPATH, f"//input[contains(@placeholder, '{text}')]"),
            (By.XPATH, f"//textarea[@placeholder='{text}']"),
            (By.XPATH, f"//textarea[contains(@placeholder, '{text}')]"),
            
            # Aria label strategies
            (By.XPATH, f"//*[@aria-label='{text}']"),
            (By.XPATH, f"//*[@aria-placeholder='{text}']"),
            
            # Title and name attributes
            (By.XPATH, f"//*[@title='{text}']"),
            (By.XPATH, f"//*[@name='{text}']"),
            
            # Case-insensitive strategies
            (By.XPATH, f"//*[translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')=translate('{text}','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')]"),
            (By.XPATH, f"//*[translate(@placeholder,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')=translate('{text}','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')]")
        ]
        
        # Add element type specific strategies
        if element_type:
            element_type = element_type.lower()
            if element_type == 'input':
                logger.debug("Adding input-specific strategies")
                strategies = [
                    # Prioritize input-specific strategies
                    (By.XPATH, f"//input[@placeholder='{text}']"),
                    (By.XPATH, f"//input[contains(@placeholder, '{text}')]"),
                    (By.XPATH, f"//textarea[@placeholder='{text}']"),
                    (By.XPATH, f"//textarea[contains(@placeholder, '{text}')]"),
                    (By.XPATH, f"//input[@aria-label='{text}']"),
                    (By.XPATH, f"//input[@name='{text}']"),
                    # Then add label-based strategies
                    (By.XPATH, f"//label[contains(text(), '{text}')]//following::input[1]"),
                    (By.XPATH, f"//label[contains(text(), '{text}')]//input"),
                    *strategies  # Add the general strategies at the end
                ]
            elif element_type in ['button', 'link']:
                logger.debug(f"Adding {element_type}-specific strategies")
                strategies.insert(0, (By.XPATH, f"//{element_type}[contains(text(),'{text}')]"))
                strategies.insert(0, (By.XPATH, f"//{element_type}[normalize-space(text())='{text}']"))
        
        # Add location context specific strategies
        if location_context:
            # Convert common location descriptions to XPath
            location_markers = {
                'header': '//header',
                'footer': '//footer',
                'navigation': '//nav',
                'sidebar': "//*[contains(@class, 'sidebar')]",
                'main': '//main',
                'top': "//*[contains(@class, 'header') or contains(@class, 'top')]",
                'bottom': "//*[contains(@class, 'footer') or contains(@class, 'bottom')]"
            }
            
            for key, marker in location_markers.items():
                if key in location_context.lower():
                    logger.debug(f"Adding location-specific strategy for '{key}'")
                    strategies.insert(0, (By.XPATH, f"{marker}//*[contains(text(),'{text}')]"))
                    # Add placeholder strategy for inputs in this location
                    strategies.insert(0, (By.XPATH, f"{marker}//input[@placeholder='{text}']"))
        
        logger.debug(f"Trying {len(strategies)} different selector strategies")
        
        # Try each strategy
        for by, selector in strategies:
            try:
                logger.debug(f"Trying selector: {by} = {selector}")
                element = self.driver.find_element(by, selector)
                if element.is_displayed():
                    logger.info(f"Found visible element using: {by} = {selector}")
                    # For XPath selectors, try to generate a more specific CSS selector
                    if by == By.XPATH:
                        css_selector = self._generate_css_selector(element)
                        if css_selector:
                            logger.info(f"Generated more specific CSS selector: {css_selector}")
                            return element, css_selector
                    return element, selector
                else:
                    logger.debug(f"Element found but not visible: {by} = {selector}")
            except NoSuchElementException:
                logger.debug(f"No element found with: {by} = {selector}")
                continue
            except Exception as e:
                logger.debug(f"Error trying selector {selector}: {str(e)}")
        
        logger.warning(f"No visible element found with text: '{text}'")
        return None, None
    
    def _generate_css_selector(self, element: WebElement) -> Optional[str]:
        """Generate a specific CSS selector for an element"""
        try:
            # Try to generate a selector using ID
            if element.get_attribute('id'):
                selector = f"#{element.get_attribute('id')}"
                logger.debug(f"Generated ID-based selector: {selector}")
                return selector
            
            # Try to generate a selector using unique class combination
            classes = element.get_attribute('class')
            if classes:
                class_list = classes.split()
                if class_list:
                    selector = '.' + '.'.join(class_list)
                    logger.debug(f"Trying class-based selector: {selector}")
                    # Verify this selector is unique
                    if len(self.driver.find_elements(By.CSS_SELECTOR, selector)) == 1:
                        logger.debug(f"Verified unique class-based selector: {selector}")
                        return selector
                    else:
                        logger.debug(f"Class-based selector not unique: {selector}")
            
            # Try to generate a selector using placeholder for input elements
            if element.tag_name in ['input', 'textarea']:
                placeholder = element.get_attribute('placeholder')
                if placeholder:
                    selector = f"{element.tag_name}[placeholder='{placeholder}']"
                    logger.debug(f"Generated placeholder-based selector: {selector}")
                    return selector
            
            logger.debug("Could not generate specific CSS selector")
            return None
            
        except Exception as e:
            logger.debug(f"Error generating CSS selector: {str(e)}")
            return None 