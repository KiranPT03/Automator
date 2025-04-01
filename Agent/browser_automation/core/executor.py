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
        
        # Initialize PostgreSQL client
        try:
            from ..databases.postgres.client import PostgresClient
            self.db_client = PostgresClient()
            logger.info("PostgreSQL client initialized in CodeExecutor")
        except Exception as db_error:
            logger.error(f"Failed to initialize PostgreSQL client: {db_error}")
            self.db_client = None
    
    def execute_prompt(self, prompt, step_id=None, step_description=None):
        """
        Execute a user prompt by generating and running code.
        
        Args:
            prompt: User prompt describing the desired action
            step_id: Optional ID of the test step being executed
            step_description: Optional description of the test step
            
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
            success = self._execute_code(navigation_code, prompt, page_state, step_id=step_id)
            
            # Record result and take screenshot if successful
            self.browser.record_result(prompt, success, error_message=None, step_id=step_id, step_description=step_description)
            if success:
                self.browser.take_screenshot()
                self.browser.wait_for_page_load()
            
            return success
        except Exception as e:
            logger.error(f"Failed to execute prompt '{prompt}' (Step ID: {step_id}): {e}")
            self.browser.record_result(prompt, False, str(e), step_id=step_id, step_description=step_description)
            return False
    
    def _execute_code(self, code, prompt, page_state, retry_count=0, step_id=None):
        """
        Safely execute playwright code with error handling and retries.
        
        Args:
            code: The code to execute
            prompt: Original user prompt
            page_state: Current page state
            retry_count: Number of previous retry attempts
            step_id: Optional ID of the test step being executed
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Normalize the code
            normalized_code = normalize_playwright_code(code)
            
            logger.info(f"Executing normalized code for step {step_id}: {normalized_code}")
            
            # Execute the code with the page object in scope
            exec(normalized_code, {'page': self.browser.page})
            
            # Wait for any navigation to complete
            self.browser.wait_for_page_load()
            
            return True
        except Exception as e:
            error_message = str(e)
            logger.error(f"Error executing code for step {step_id}: {error_message}")
            
            # Retry with different approach if we haven't exceeded max retries
            if retry_count < MAX_RETRY_COUNT:
                logger.info(f"Retrying step {step_id}... Attempt {retry_count + 1}")
                
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
                return self._execute_code(new_code, prompt, updated_page_state, retry_count + 1, step_id=step_id)
            
            # If we've exceeded max retries, fail
            self.browser.record_result(prompt, False, error_message, step_id=step_id)
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
            prompts: List of user prompts or test step objects/dictionaries
            
        Returns:
            bool: True if all prompts executed successfully, False otherwise
        """
        all_successful = True
        
        for prompt_item in prompts:
            # Check if prompt_item is a string, dictionary, or object
            if isinstance(prompt_item, str):
                prompt = prompt_item
                step_id = None
                step_description = None
            elif isinstance(prompt_item, dict):
                # Handle dictionary format - use stepId instead of id
                prompt = prompt_item.get('prompt')
                step_id = prompt_item.get('stepId')  # Changed from 'id' to 'stepId'
                step_description = prompt_item.get('description')
            else:
                # Assume it's an object with attributes
                try:
                    prompt = getattr(prompt_item, 'prompt')
                    step_id = getattr(prompt_item, 'stepId', None)  # Changed from 'id' to 'stepId'
                    step_description = getattr(prompt_item, 'description', None)
                except AttributeError:
                    logger.error(f"Invalid prompt item format: {prompt_item}")
                    all_successful = False
                    continue
            
            logger.info(f"Executing prompt: {prompt} (Step ID: {step_id})")
            
            # Update step status to Executing in the database
            if step_id and self.db_client:
                try:
                    data = {
                        'step_status': 'Executing',
                        'updated_at': 'NOW()'
                    }
                    condition = f"step_id = '{step_id}'"
                    self.db_client.update_record('test_steps', data, condition)
                    
                    logger.info(f"Updated step {step_id} status to 'Executing'")
                except Exception as db_error:
                    logger.error(f"Failed to update step status in database: {db_error}")
            
            success = self.execute_prompt(prompt, step_id=step_id, step_description=step_description)
            if not success:
                all_successful = False
        
        # Print execution summary
        self.browser.print_summary()
        
        return all_successful