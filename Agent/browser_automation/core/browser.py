"""
Core browser management functionality.
"""
import os
import signal
import sys
import logging
from playwright.sync_api import sync_playwright
from ..config.settings import BROWSER_CONFIG, CONTEXT_CONFIG, SCREENSHOT_DIR

logger = logging.getLogger(__name__)

class BrowserController:
    """
    Manages browser lifecycle and provides core browser functionality.
    """
    
    def __init__(self):
        """Initialize the browser controller."""
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
        self.screenshot_counter = 1
        self.execution_results = []
        
        # Ensure screenshot directory exists
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        
        # Set up signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
    
    def _signal_handler(self, sig, frame):
        """
        Handle shutdown signals gracefully.
        
        Args:
            sig: Signal number
            frame: Current stack frame
        """
        logger.info("Received shutdown signal. Cleaning up...")
        self.cleanup()
        sys.exit(0)
    
    def launch(self):
        """
        Launch the browser and create a new context and page.
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            self.playwright = sync_playwright().start()
            self.browser = self.playwright.chromium.launch(**BROWSER_CONFIG)
            self.context = self.browser.new_context(**CONTEXT_CONFIG)
            self.page = self.context.new_page()
            logger.info("Browser launched successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to launch browser: {e}")
            self.cleanup()
            return False
    
    def cleanup(self):
        """Clean up browser resources."""
        try:
            if self.context:
                logger.info("Closing browser context...")
                self.context.close()
                self.context = None
            
            if self.browser:
                logger.info("Closing browser...")
                self.browser.close()
                self.browser = None
            
            if self.playwright:
                logger.info("Stopping Playwright...")
                self.playwright.stop()
                self.playwright = None
                
            logger.info("Cleanup completed successfully")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    def take_screenshot(self, name=None):
        """
        Take a screenshot of the current page.
        
        Args:
            name: Optional name for the screenshot
            
        Returns:
            str: Path to the saved screenshot
        """
        try:
            if not self.page:
                logger.error("Cannot take screenshot: No active page")
                return None
            
            if name:
                screenshot_path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
            else:
                screenshot_path = os.path.join(SCREENSHOT_DIR, f"screenshot_{self.screenshot_counter}.png")
                self.screenshot_counter += 1
            
            self.page.screenshot(path=screenshot_path, full_page=True)
            logger.info(f"Screenshot saved: {screenshot_path}")
            return screenshot_path
        except Exception as e:
            logger.error(f"Failed to take screenshot: {e}")
            return None
    
    def wait_for_page_load(self):
        """Wait for the page to fully load."""
        try:
            if not self.page:
                return
            
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_load_state("load")
            self.page.wait_for_load_state("networkidle")
        except Exception as e:
            logger.error(f"Error waiting for page load: {e}")
    
    def toggle_fullscreen(self):
        """Toggle fullscreen mode."""
        try:
            if not self.page:
                return
            
            self.page.keyboard.press("F11")
            logger.info("Toggled fullscreen mode")
        except Exception as e:
            logger.error(f"Failed to toggle fullscreen: {e}")
    
    def record_result(self, prompt, success, error=None):
        """
        Record the result of an action.
        
        Args:
            prompt: The prompt that was executed
            success: Whether the action was successful
            error: Optional error message
        """
        if success:
            result = f"[SUCCESS] {prompt}"
        else:
            result = f"[FAILED] {prompt}" + (f" (Error: {error})" if error else "")
        
        self.execution_results.append(result)
        logger.info(result)
    
    def print_summary(self):
        """Print a summary of all execution results."""
        logger.info("\nExecution Summary:")
        for result in self.execution_results:
            logger.info(result)