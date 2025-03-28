"""
Code execution engine for browser automation.
"""
import logging
from ..ai.code_generator import CodeGenerator
from ..utils.code_normalizer import normalize_playwright_code
from ..utils.page_analyzer import get_page_state
from ..config.settings import MAX_RETRY_COUNT

logger = logging.getLogger(__name__)

class CodeExecutor:
    """
    Executes generated code in the browser environment.
    """
    
    def __init__(self, browser_controller, code_generator=None):
        """
        Initialize the code executor.
        
        Args:
            browser_controller: BrowserController instance
            code_generator: Optional CodeGenerator instance
        """
        self.browser = browser_controller
        self.code_generator = code_generator or CodeGenerator()
    
    def execute_prompt(self, prompt):
        """
        Execute a user prompt by generating and running code.
        
        Args:
            prompt: User prompt describing the desired action
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.browser.page:
            logger.error("Cannot execute prompt: No active page")
            return False
        
        # Get current page state
        page_state = get_page_state(self.browser.page)
        
        # Generate navigation code
        navigation_code = self.code_generator.generate_navigation_code(prompt, page_state)
        
        # Execute the code
        try:
            success = self._execute_code(navigation_code, prompt, page_state)
            
            # Record result and take screenshot if successful
            self.browser.record_result(prompt, success)
            if success:
                self.browser.take_screenshot()
                self.browser.wait_for_page_load()
            
            return success
        except Exception as e:
            logger.error(f"Failed to execute prompt '{prompt}': {e}")
            self.browser.record_result(prompt, False, str(e))
            return False
    
    def _execute_code(self, code, prompt, page_state, retry_count=0):
        """
        Safely execute playwright code with error handling and retries.
        
        Args:
            code: The code to execute
            prompt: Original user prompt
            page_state: Current page state
            retry_count: Number of previous retry attempts
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Normalize the code
            normalized_code = normalize_playwright_code(code)
            
            logger.info(f"Executing normalized code: {normalized_code}")
            
            # Execute the code with the page object in scope
            exec(normalized_code, {'page': self.browser.page})
            
            # Wait for any navigation to complete
            self.browser.wait_for_page_load()
            
            return True
        except Exception as e:
            error_message = str(e)
            logger.error(f"Error executing code: {error_message}")
            
            # Retry with different approach if we haven't exceeded max retries
            if retry_count < MAX_RETRY_COUNT:
                logger.info(f"Retrying... Attempt {retry_count + 1}")
                
                # Get updated page state
                updated_page_state = get_page_state(self.browser.page)
                
                # Generate enhanced prompt based on error type
                enhanced_prompt = self._generate_enhanced_prompt(prompt, error_message)
                
                # Generate new code with enhanced prompt and error information
                new_code = self.code_generator.generate_navigation_code(
                    enhanced_prompt,
                    updated_page_state,
                    error_message,
                    retry_count + 1
                )
                
                # Try again with the new code
                return self._execute_code(new_code, prompt, updated_page_state, retry_count + 1)
            
            # If we've exceeded max retries, fail
            self.browser.record_result(prompt, False, error_message)
            return False
    
    def _generate_enhanced_prompt(self, original_prompt, error_message):
        """
        Generate an enhanced prompt based on the error message.
        
        Args:
            original_prompt: The original user prompt
            error_message: The error message from the failed execution
            
        Returns:
            str: Enhanced prompt with error-specific guidance
        """
        # Generic enhanced prompt template
        enhanced_prompt = f"""
        Action failed: {original_prompt}
        
        Error encountered: {error_message}
        
        Please generate new code that:
        1. Uses alternative selectors if the current one failed
        2. Handles any visibility issues with elements
        3. Checks for iframes if elements might be inside them
        4. Implements appropriate waits for elements or conditions
        5. Uses try-catch blocks to attempt multiple strategies
        """
        
        return enhanced_prompt
    
    def execute_prompts(self, prompts):
        """
        Execute a list of prompts in sequence.
        
        Args:
            prompts: List of user prompts
            
        Returns:
            bool: True if all prompts executed successfully, False otherwise
        """
        all_successful = True
        
        for prompt in prompts:
            logger.info(f"Executing prompt: {prompt}")
            success = self.execute_prompt(prompt)
            if not success:
                all_successful = False
        
        # Print execution summary
        self.browser.print_summary()
        
        return all_successful