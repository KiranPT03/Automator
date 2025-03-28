"""
Main entry point for the browser automation application.
"""
import sys
import os  # Add this import
import argparse
from browser_automation import BrowserController, CodeExecutor
from browser_automation.utils.logging_config import setup_logging

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Browser Automation Tool")
    parser.add_argument(
        "--prompts", 
        nargs="+", 
        help="List of prompts to execute"
    )
    parser.add_argument(
        "--prompt-file", 
        help="Path to a file containing prompts (one per line)"
    )
    parser.add_argument(
        "--debug", 
        action="store_true", 
        help="Enable debug logging"
    )
    return parser.parse_args()

def load_prompts_from_file(file_path):
    """Load prompts from a file."""
    try:
        with open(file_path, 'r') as f:
            return [line.strip() for line in f if line.strip()]
    except Exception as e:
        print(f"Error loading prompts from file: {e}")
        sys.exit(1)

def main():
    """Main application entry point."""
    args = parse_arguments()
    
    # Set up logging
    logger = setup_logging()
    
    # Get prompts from arguments or use default
    prompts = []
    if args.prompts:
        prompts = args.prompts
    elif args.prompt_file:
        prompts = load_prompts_from_file(args.prompt_file)
    else:
        prompts = [
        'Navigate to "https://trello.com/"',
        'Click on "Log in"',
        'type email as "type email as "kiran.p.tavadare@gmail.com"',
        'Tick on "Remember me"',
        'Click on "Continue" button',
        'type password as "123kPt098#"',
        'Click on "Log in" button',
        'Check for text "Incorrect email address and / or password. If you recently migrated your Trello account to an Atlassian account, you will need to use your Atlassian account password. Alternatively"'
    ]
        # prompts = [
        #    'Navigate to "https://uptimed.azure.rockwellautomation.com/"',
        #    'type username as "rfurgal@ra.rockwell.com"',
        #    'Click on "Login"',
        #    'Check "Incorrect username or password" text exist'
        # ]
    
    # Initialize browser controller
    browser = BrowserController()
    
    try:
        # Launch browser
        if not browser.launch():
            logger.error("Failed to launch browser. Exiting.")
            return 1
        
        # Initialize code executor
        executor = CodeExecutor(browser)
        
        # Execute prompts
        executor.execute_prompts(prompts)
        
        # Toggle fullscreen and wait for user to close
        browser.toggle_fullscreen()
        
        # Keep the browser open until user interrupts
        logger.info("Browser automation complete. Press Ctrl+C to exit.")
        try:
            while True:
                browser.page.wait_for_timeout(1000)
        except Exception as e:
            logger.error(f"Error in wait loop: {e}")
            # Force exit if wait loop fails
            return 1
    except KeyboardInterrupt:
        logger.info("User interrupted. Exiting.")
    finally:
        # Clean up resources
        browser.cleanup()
        # Force exit the process to ensure complete termination
        logger.info("Forcing application exit...")
        os._exit(0)  # Use os._exit to force immediate termination
    
    return 0

if __name__ == "__main__":
    sys.exit(main())