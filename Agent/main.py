"""
Main entry point for the browser automation application.
"""
import sys
import os
import time
import asyncio
import threading
from browser_automation import BrowserController, CodeExecutor
from browser_automation.utils.logging_config import setup_logging
from browser_automation.connectors.nats.consumer import NatsConsumer

# Global variables for NATS integration
browser = None
executor = None
logger = None
automation_event = None
automation_prompts = []
browser_needs_restart = False

# NATS message handler
async def handle_nats_message(message_data):
    """Handle incoming NATS messages."""
    global browser, executor, logger, automation_event, automation_prompts, browser_needs_restart
    
    logger.info(f"Received NATS message: {message_data}")
    
    test_steps = []
    
    # Check if message contains prompts (legacy format)
    if message_data and 'prompts' in message_data and isinstance(message_data['prompts'], list):
        # Convert simple prompts to test step objects
        for i, prompt in enumerate(message_data['prompts']):
            test_steps.append({
                'stepId': f"prompt-{i+1}",
                'description': prompt,
                'prompt': prompt
            })
        logger.info(f"Converted prompts to test steps: {test_steps}")
    
    # Extract test steps if available (preferred format)
    elif message_data and 'testSteps' in message_data and isinstance(message_data['testSteps'], list):
        # Process test steps
        for step in message_data['testSteps']:
            step_data = {}
            step_data['stepId'] = step.get('stepId', f"step-{len(test_steps)+1}")
            
            # Use description or stepData as the prompt
            if 'description' in step and step['description']:
                step_data['description'] = step['description']
                step_data['prompt'] = step['description']
            elif 'stepData' in step and step['stepData']:
                step_data['description'] = step.get('description', step['stepData'])
                step_data['prompt'] = step['stepData']
            else:
                continue  # Skip steps without description or stepData
                
            test_steps.append(step_data)
        
        logger.info(f"Using test steps from message: {test_steps}")
    
    if not test_steps:
        logger.warning("No test steps found in message, skipping automation")
        return
    
    # Schedule the browser automation to run in the main thread
    automation_prompts = test_steps
    
    # Set flag to indicate browser needs to be restarted
    browser_needs_restart = True
    
    # Signal the main thread to process the automation
    automation_event.set()
    
    logger.info("Scheduled browser automation to run in main thread")

# Function to run NATS consumer in a separate thread
def run_nats_consumer():
    """Run the NATS consumer in a separate thread."""
    asyncio.run(start_nats_consumer())

async def start_nats_consumer():
    """Start the NATS consumer."""
    global logger
    logger.info("Starting NATS consumer...")
    consumer = NatsConsumer()
    await consumer.run(handle_nats_message)

def main():
    """Main application entry point."""
    global browser, executor, logger, automation_event, automation_prompts, browser_needs_restart
    
    # Initialize event for signaling between threads
    automation_event = threading.Event()
    
    # Set up logging
    logger = setup_logging()
    
    # Initialize browser controller
    browser = BrowserController()
    
    try:
        # Initialize code executor
        executor = CodeExecutor(browser)
        
        logger.info("Starting in NATS consumer mode. Waiting for messages...")
        
        # Start NATS consumer in a separate thread
        nats_thread = threading.Thread(target=run_nats_consumer, daemon=True)
        nats_thread.start()
        
        # Keep the application running and handle automation events
        try:
            while True:
                # Check if there's a pending automation request
                if automation_event.is_set():
                    logger.info("Processing automation request from NATS message")
                    
                    # Check if we need to recreate the browser instance
                    if browser_needs_restart:
                        logger.info("Recreating browser instance")
                        
                        # Clean up existing browser if it exists
                        if browser:
                            browser.cleanup()
                        
                        # Create a new browser instance
                        browser = BrowserController()
                        executor = CodeExecutor(browser)
                        browser_needs_restart = False
                    
                    # Launch browser if not already launched
                    if not hasattr(browser, 'page') or browser.page is None:
                        logger.info("Launching browser for automation")
                        if not browser.launch():
                            logger.error("Failed to launch browser for automation")
                        else:
                            # Execute the test steps
                            executor.execute_prompts(automation_prompts)
                            logger.info("Completed execution of test steps")
                            
                            # Close only the browser context, not the entire application
                            if hasattr(browser, 'context') and browser.context is not None:
                                browser.context.close()
                            elif hasattr(browser, 'page') and browser.page is not None:
                                browser.page.close()
                            
                            # Reset browser page reference but keep browser instance alive
                            browser.page = None
                            logger.info("Browser window closed after automation, NATS consumer still active")
                    else:
                        # Execute the test steps with existing browser
                        executor.execute_prompts(automation_prompts)
                        logger.info("Completed execution of test steps")
                        
                        # Close only the browser context, not the entire application
                        if hasattr(browser, 'context') and browser.context is not None:
                            browser.context.close()
                        elif hasattr(browser, 'page') and browser.page is not None:
                            browser.page.close()
                        
                        # Reset browser page reference but keep browser instance alive
                        browser.page = None
                        logger.info("Browser window closed after automation, NATS consumer still active")
                    
                    # Reset the event
                    automation_event.clear()
                
                # Sleep to avoid high CPU usage
                time.sleep(0.1)
                
                # If browser is launched, use its wait method
                if hasattr(browser, 'page') and browser.page is not None:
                    browser.page.wait_for_timeout(100)  # Reduced timeout for more responsive event handling
                
        except Exception as e:
            logger.error(f"Error in wait loop: {e}")
            return 1
            
    except KeyboardInterrupt:
        logger.info("User interrupted. Exiting.")
    finally:
        # Clean up resources
        if browser:
            browser.cleanup()
        # Force exit the process to ensure complete termination
        logger.info("Forcing application exit...")
        os._exit(0)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())