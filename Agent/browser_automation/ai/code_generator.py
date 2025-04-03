"""
AI-powered code generation for browser automation.
"""
import google.generativeai as genai
import logging
import re  # Add this import for regex pattern matching
from bs4 import BeautifulSoup  # Add BeautifulSoup for HTML parsing
from ..config.settings import GEMINI_API_KEY, GEMINI_MODEL
from ..utils.page_analyzer import extract_page_summary

logger = logging.getLogger(__name__)

class CodeGenerator:
    """
    Generates Playwright code using AI models.
    """
    
    def __init__(self, api_key=None, model_name=None):
        """
        Initialize the code generator with API key and model.
        
        Args:
            api_key: Optional API key for the AI service
            model_name: Optional model name to use
        """
        self.api_key = api_key or GEMINI_API_KEY
        self.model_name = model_name or GEMINI_MODEL
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the AI model with the API key."""
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            logger.info(f"AI model {self.model_name} initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AI model: {e}")
            raise
    
    def generate_navigation_code(self, prompt, page_state=None, error=None, retry_count=0):
        """
        Generate Playwright code for browser navigation based on a prompt.
        
        Args:
            prompt: User prompt describing the desired action
            page_state: Current page state (optional)
            error: Previous error message (optional)
            retry_count: Number of previous retry attempts
            
        Returns:
            str: Generated Playwright code
        """
        # Enhanced system prompt with error handling and BeautifulSoup integration
        system_prompt = """
        You are a Playwright code generator. Generate ONLY the raw code without formatting.
        Do NOT include browser initialization (browser = p.chromium.launch()) or cleanup (browser.close()).
        Do NOT create new pages (page = browser.new_page()) as they are already initialized.
        Do NOT include Playwright context manager (with sync_playwright() as p:).
        If page source is provided, analyze it to find the correct selectors and elements.
        If there was an error in previous execution, analyze it and fix the code.
        Ensure the code uses proper Playwright selectors and methods.
        Example navigation: page.goto("https://www.google.com", wait_until="networkidle")
        Example click: page.get_by_role("button", name="Sign in").click()
        
        When selecting elements, try multiple strategies in this order of preference:
        1. Use role-based selectors: page.get_by_role("button", name="Submit")
        2. Use text-based selectors: page.get_by_text("Sign in")
        3. Use label-based selectors: page.get_by_label("Email")
        4. Use placeholder-based selectors: page.get_by_placeholder("Enter your email")
        5. Use test ID selectors if available: page.get_by_test_id("login-button")
        6. Use CSS selectors with specific attributes: page.locator("button[type='submit']")
        7. Use XPath as a last resort: page.locator("//button[contains(text(), 'Submit')]")
        
        When analyzing error logs:
        1. Look for element selectors mentioned in the error (e.g., id, name, class)
        2. Check if elements are in iframes and handle accordingly
        3. For invisible elements, try waiting for visibility or use different selectors
        4. For timeout errors, try more specific selectors or increase timeout
        5. Implement try-catch blocks to attempt multiple selector strategies
        
        If one selector fails, try alternative selectors. For example:
        try:
            page.get_by_role("button", name="Sign in").click()
        except:
            try:
                page.get_by_text("Sign in").click()
            except:
                page.locator("button.login-button").click()
                
        If BeautifulSoup selectors are provided, use them for more precise element targeting.
        """
        
        # Process page state for better context
        page_state_summary = extract_page_summary(page_state) if page_state else "No page state available"
        
        # Enhanced error analysis
        error_analysis = ""
        if error:
            error_analysis = self._analyze_error_log(error)
        
        # Generate BeautifulSoup selectors if page state is available
        bs_selectors = ""
        if page_state and 'html_content' in page_state:
            bs_selectors = self._generate_bs_selectors(page_state['html_content'], prompt)
        
        # Include page source, error, and BeautifulSoup selectors in the prompt
        full_prompt = f"""
        Current page state:
        {page_state_summary}
        
        Previous error:
        {error if error else 'No previous error'}
        
        Error analysis:
        {error_analysis}
        
        BeautifulSoup selectors:
        {bs_selectors}
        
        Retry attempt: {retry_count if retry_count > 0 else 'First attempt'}
        
        User request: {prompt}
        """
        
        logger.info(f"Generating code for prompt: {prompt}")
        if retry_count > 0:
            logger.info(f"Retry attempt: {retry_count}")
        
        try:
            # Generate response
            response = self.model.generate_content([system_prompt, full_prompt])
            code = response.text.strip().replace('```python', '').replace('```', '').strip()
            logger.debug(f"Generated code: {code}")
            return code
        except Exception as e:
            logger.error(f"Error generating code: {e}")
            # Fallback to a simple navigation if AI fails
            if "navigate" in prompt.lower() and "http" in prompt.lower():
                url = prompt.split("http")[1].split('"')[0]
                return f'page.goto("http{url}", wait_until="networkidle")'
            return f'# AI generation failed: {str(e)}\n# Attempting basic action\npage.wait_for_timeout(1000)'
    
    def _generate_bs_selectors(self, html_content, prompt):
        """
        Generate BeautifulSoup-based selectors for elements that match the prompt.
        
        Args:
            html_content: HTML content of the page
            prompt: User prompt describing the desired action
            
        Returns:
            str: BeautifulSoup selectors for relevant elements
        """
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            selectors = []
            
            # Extract keywords from the prompt
            keywords = self._extract_keywords(prompt)
            
            # Find elements that might match the prompt
            for keyword in keywords:
                # Look for buttons, links, inputs, etc. with text or attributes matching the keyword
                for element in soup.find_all(['button', 'a', 'input', 'select', 'textarea', 'div', 'span']):
                    if self._element_matches_keyword(element, keyword):
                        selector = self._generate_selector_for_element(element)
                        if selector:
                            selectors.append({
                                'keyword': keyword,
                                'selector': selector,
                                'element_type': element.name,
                                'element_text': element.text.strip() if element.text else None,
                                'element_attrs': dict(element.attrs)
                            })
            
            # Format the selectors as a string
            if selectors:
                result = "Recommended selectors based on BeautifulSoup analysis:\n"
                for i, sel in enumerate(selectors[:5]):  # Limit to top 5 matches
                    result += f"{i+1}. For '{sel['keyword']}': {sel['selector']} ({sel['element_type']})\n"
                    if sel['element_text']:
                        result += f"   Text: {sel['element_text'][:50]}...\n" if len(sel['element_text']) > 50 else f"   Text: {sel['element_text']}\n"
                    result += f"   Attributes: {sel['element_attrs']}\n"
                return result
            else:
                return "No relevant elements found using BeautifulSoup analysis."
        except Exception as e:
            logger.error(f"Error generating BeautifulSoup selectors: {e}")
            return f"Failed to generate BeautifulSoup selectors: {str(e)}"
    
    def _extract_keywords(self, prompt):
        """
        Extract keywords from the prompt that might be used to find elements.
        
        Args:
            prompt: User prompt
            
        Returns:
            list: Keywords extracted from the prompt
        """
        # Remove common words and split into keywords
        common_words = ['click', 'navigate', 'go', 'to', 'the', 'and', 'or', 'on', 'a', 'an', 'in', 'for', 'with', 'by']
        words = prompt.lower().split()
        keywords = [word for word in words if word not in common_words and len(word) > 2]
        
        # Add phrases (2-3 consecutive words)
        phrases = []
        for i in range(len(words) - 1):
            phrases.append(' '.join(words[i:i+2]))
        for i in range(len(words) - 2):
            phrases.append(' '.join(words[i:i+3]))
        
        return list(set(keywords + phrases))
    
    def _element_matches_keyword(self, element, keyword):
        """
        Check if an element matches a keyword.
        
        Args:
            element: BeautifulSoup element
            keyword: Keyword to match
            
        Returns:
            bool: True if the element matches the keyword
        """
        # Check element text
        if element.text and keyword.lower() in element.text.lower():
            return True
        
        # Check element attributes
        for attr, value in element.attrs.items():
            if isinstance(value, str) and keyword.lower() in value.lower():
                return True
            elif isinstance(value, list):
                for v in value:
                    if isinstance(v, str) and keyword.lower() in v.lower():
                        return True
        
        return False
    
    def _generate_selector_for_element(self, element):
        """
        Generate a CSS selector for a BeautifulSoup element.
        
        Args:
            element: BeautifulSoup element
            
        Returns:
            str: CSS selector for the element
        """
        # Try to generate a selector based on ID
        if element.get('id'):
            return f"#{element['id']}"
        
        # Try to generate a selector based on unique class
        if element.get('class'):
            return f"{element.name}.{'.'.join(element['class'])}"
        
        # Try to generate a selector based on name
        if element.get('name'):
            return f"{element.name}[name='{element['name']}']"
        
        # Try to generate a selector based on other attributes
        for attr in ['type', 'role', 'aria-label', 'data-testid', 'placeholder']:
            if element.get(attr):
                return f"{element.name}[{attr}='{element[attr]}']"
        
        # Generate a selector based on text content
        if element.text and element.text.strip():
            text = element.text.strip()
            if len(text) > 50:
                text = text[:50]
            return f"{element.name}:contains('{text}')"
        
        # If all else fails, generate an XPath selector
        return None
    
    def _analyze_error_log(self, error_log):
        """
        Analyze error logs to extract useful information for code generation.
        
        Args:
            error_log: The error log to analyze
            
        Returns:
            str: Analysis of the error log
        """
        analysis = []
        
        # Extract element information from error log
        element_info = self._extract_element_info(error_log)
        if element_info:
            analysis.append(f"Element information found: {element_info}")
        
        # Check for common error patterns
        if "element is not visible" in error_log:
            analysis.append("Issue: Element was found but not visible")
            analysis.append("Suggestion: Try waiting for visibility or use a different visible element")
        
        if "timeout" in error_log.lower():
            analysis.append("Issue: Timeout occurred while waiting for element")
            analysis.append("Suggestion: Try more specific selectors or increase timeout")
        
        if "no element found" in error_log.lower() or "element not found" in error_log.lower():
            analysis.append("Issue: Element not found with current selector")
            analysis.append("Suggestion: Try alternative selector strategies")
        
        if "iframe" in error_log.lower():
            analysis.append("Issue: Element might be inside an iframe")
            analysis.append("Suggestion: Switch to the appropriate iframe before interacting with the element")
        
        # Check for specific Playwright error patterns
        if "waiting for get_by" in error_log:
            selector_type = "get_by_" + error_log.split("waiting for get_by_")[1].split("(")[0]
            selector_value = error_log.split(f"{selector_type}(")[1].split(")")[0]
            analysis.append(f"Selector used: {selector_type}({selector_value})")
            analysis.append(f"Suggestion: Try alternative to {selector_type}")
        
        if "locator resolved to" in error_log:
            element_html = error_log.split("locator resolved to ")[1].split("/>")[0] + "/>"
            analysis.append(f"Element found: {element_html}")
            analysis.append("Suggestion: Extract attributes from this element for more precise targeting")
        
        return "\n".join(analysis) if analysis else "No specific patterns found in error log"
    
    def _extract_element_info(self, error_log):
        """
        Extract element information from error logs.
        
        Args:
            error_log: The error log to analyze
            
        Returns:
            dict: Extracted element information
        """
        element_info = {}
        
        # Extract element ID
        id_match = re.search(r'id="([^"]*)"', error_log)
        if id_match:
            element_info['id'] = id_match.group(1)
        
        # Extract element name
        name_match = re.search(r'name="([^"]*)"', error_log)
        if name_match:
            element_info['name'] = name_match.group(1)
        
        # Extract element class
        class_match = re.search(r'class="([^"]*)"', error_log)
        if class_match:
            element_info['class'] = class_match.group(1)
        
        # Extract element type
        type_match = re.search(r'type="([^"]*)"', error_log)
        if type_match:
            element_info['type'] = type_match.group(1)
        
        # Extract element tag
        tag_match = re.search(r'<(\w+)\s', error_log)
        if tag_match:
            element_info['tag'] = tag_match.group(1)
        
        return element_info if element_info else None