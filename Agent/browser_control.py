from playwright.sync_api import sync_playwright
import google.generativeai as genai
import os
import signal
import sys
import logging

# Add global variable for browser and context
browser = None
context = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def signal_handler(sig, frame):
    logger.info("Received shutdown signal. Cleaning up...")
    try:
        if context:
            logger.info("Closing browser context...")
            context.close()
        if browser:
            logger.info("Closing browser...")
            browser.close()
        logger.info("Cleanup completed successfully")
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
    finally:
        sys.exit(0)

def get_navigation_code(prompt, page_source=None, error=None, retry_count=0):
    # Configure Gemini AI
    genai.configure(api_key="AIzaSyCnF-imPoBc_8t88fPoZnSdc3P-RWSNzzU")
    model = genai.GenerativeModel('gemini-2.0-flash-exp-image-generation')
    
    # Enhanced system prompt with error handling
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
    """
    
    # Include page source and error in the prompt if available
    full_prompt = f"""
    Current page source:
    {page_source if page_source else 'No page source available'}
    
    Previous error:
    {error if error else 'No previous error'}
    
    User request: {prompt}
    """
    
    # Generate response
    response = model.generate_content([system_prompt, full_prompt])
    return response.text.strip().replace('```python', '').replace('```', '').strip()

def execute_playwright_code(page, code, prompt, page_state, retry_count=0):
    """Safely execute playwright code with error handling and retries"""
    try:
        # Remove any Playwright context creation from the code
        normalized_code = normalize_playwright_code(code)
        normalized_code = normalized_code.replace(
            'from playwright.sync_api import sync_playwright', ''
        ).replace(
            'from playwright.async_api import async_playwright', ''
        ).replace(
            'with sync_playwright() as playwright:', ''
        ).replace(
            'async with async_playwright() as playwright:', ''
        ).replace(
            'run(playwright)', ''
        ).replace(
            'asyncio.run(main())', ''
        ).strip()
        
        # Remove async/await keywords
        normalized_code = normalized_code.replace('async ', '').replace('await ', '')
        
        logger.info(f"Executing normalized code: {normalized_code}")
        exec(normalized_code, {'page': page})
        return True
    except Exception as e:
        logger.error(f"Error executing code: {e}")
        if retry_count < 4:
            logger.info(f"Retrying... Attempt {retry_count + 1}")
            # Try different locators if the error is related to element not found
            if "element not found" in str(e).lower() or "selector" in str(e).lower():
                new_code = get_navigation_code(
                    f"Try different locator for: {prompt}", 
                    page_state, 
                    str(e), 
                    retry_count + 1
                )
            else:
                new_code = get_navigation_code(
                    prompt, 
                    page_state, 
                    str(e), 
                    retry_count + 1
                )
            return execute_playwright_code(page, new_code, prompt, page_state, retry_count + 1)
        raise

def open_fullscreen_browser(prompts):
    global browser, context
    execution_results = []  # To store execution status
    screenshot_counter = 1  # To keep track of screenshot sequence
    
    with sync_playwright() as p:
        try:
            signal.signal(signal.SIGINT, signal_handler)
            
            browser = p.chromium.launch(
                headless=False,
                args=['--start-maximized', '--start-fullscreen', '--kiosk']
            )
            context = browser.new_context(
                no_viewport=True
            )
            
            page = context.new_page()
            page_state = None
            
            # Execute each prompt in sequence
            for prompt in prompts:
                logger.info(f"Executing prompt: {prompt}")
                navigation_code = get_navigation_code(prompt, page_state)
                try:
                    success = execute_playwright_code(page, navigation_code, prompt, page_state)
                    if success:
                        execution_results.append(f"✅ Success: {prompt}")
                        # Take screenshot only after successful action
                        screenshot_path = f"screenshot_{screenshot_counter}.png"
                        page.screenshot(path=screenshot_path, full_page=True)
                        logger.info(f"Screenshot saved: {screenshot_path}")
                        screenshot_counter += 1
                    else:
                        execution_results.append(f"❌ Failed: {prompt}")
                except Exception as e:
                    execution_results.append(f"❌ Failed: {prompt} (Error: {str(e)})")
                    continue
                
                page.wait_for_load_state("domcontentloaded")
                page.wait_for_load_state("load")
                
                # Get updated page state for next prompt
                page_state = get_page_state(page)
                logger.info("Page state updated for next action")
            
            # Force fullscreen mode
            page.keyboard.press("F11")
            
            # Keep the browser open
            page.wait_for_timeout(-1)
        except KeyboardInterrupt:
            signal_handler(signal.SIGINT, None)
        finally:
            # Display execution results
            logger.info("\nExecution Summary:")
            for result in execution_results:
                logger.info(result)

def normalize_playwright_code(code):
    """Convert common method naming variations to correct Playwright syntax"""
    replacements = {
        'getByRole': 'get_by_role',
        'getByText': 'get_by_text',
        'getByLabel': 'get_by_label',
        'getByPlaceholder': 'get_by_placeholder',
        'getByTestId': 'get_by_test_id',
        'click()': 'click()',
        'type(': 'fill('
    }
    
    for old, new in replacements.items():
        code = code.replace(old, new)
    return code

def get_page_state(page):
    """Get current page state including HTML and relevant JavaScript state"""
    try:
        # Get HTML content
        html_content = page.content()
        # Get page URL
        current_url = page.url
        # Get any visible text that might be useful
        visible_text = page.evaluate('() => document.body.innerText')
        
        return {
            'html': html_content,
            'url': current_url,
            'text': visible_text
        }
    except Exception as e:
        logger.error(f"Error getting page state: {e}")
        return None

if __name__ == "__main__":
    # prompts = [
    #     'navigate to "www.google.com"',
    #     'Click on "Sign in" button',
    #     'type "type "kiranpt.rockwell@gmail.com" in "Email" field',
    #     'Click on "Next" button',
    #     'type "123RockWell098#" in "Password" field',
    #     'Click on "Next" button'
    # ]
    # prompts = [
    #     'navigate to "www.flipkart.com"',
    #     'Click on "Login"',
    #     'type "8275127282" in "Mobile number" field',
    #     'Click on "Request OTP" button'
    # ]

    # prompts = ['navigate to "https://www.atlassian.com/"',
    #             'Click on "Sign in', 
    #             'type email as "kiran.p.tavadare@gmail.com"','Click on "Continue" button']
    # prompts = [
    #             'navigate to "https://www.atlassian.com/"',
    #             'Click on "Sign in"', 
    #             'Click on "Continue" button',
    #             'Check "how are you?" text exists'
    #             ]

    # prompts = [
    #     'navigate to "https://www.amazon.in/"',
    #     'Hover on "Accounts & Lists"',
    #     'Click on "Sign in"',
    #     'type mobile phone number as "8275127282"',
    #     'Click on "Continue" button',
    # ]
    prompts = [
        'Navigate to "https://trello.com/"',
        'Click on "Log in"',
        'type email as "type email as "kiran.p.tavadare@gmail.com"',
        'Tick on "Remember me"',
        'Click on "Continue" button',
        'type password as "123kPt098#"',
        'Click on "Log in" button'
    ]
    open_fullscreen_browser(prompts)