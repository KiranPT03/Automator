"""
Example script demonstrating the usage of the Playwright automation framework.
"""
from playwright.sync_api import sync_playwright
from src.browser.executor import execute_playwright_code
from config.settings import BROWSER_CONFIG, SCREENSHOT_CONFIG


def main():
    """Main function demonstrating basic usage of the framework."""
    with sync_playwright() as p:
        # Launch browser with configuration
        browser = p.chromium.launch(**BROWSER_CONFIG)
        page = browser.new_page()

        # Example 1: Simple navigation and screenshot
        code_string_1 = """
        page.goto('https://example.com')
        page.screenshot(path='example_screenshot.png', **SCREENSHOT_CONFIG)
        result = page.title()
        """
        result_1 = execute_playwright_code(page, code_string_1)
        print(f"Example 1 Result: {result_1}")

        # Example 2: Form interaction
        code_string_2 = """
        page.goto('https://example.com')
        page.fill('input[name="username"]', 'test_user')
        page.fill('input[name="password"]', 'test_pass')
        page.click('button[type="submit"]')
        result = page.url
        """
        result_2 = execute_playwright_code(page, code_string_2)
        print(f"Example 2 Result: {result_2}")

        # Example 3: Complex interaction with error handling
        code_string_3 = """
        try:
            page.goto('https://example.com')
            page.wait_for_selector('.dynamic-content', timeout=5000)
            result = page.evaluate('document.querySelector(".dynamic-content").textContent')
        except Exception as e:
            result = f"Error occurred: {str(e)}"
        """
        result_3 = execute_playwright_code(page, code_string_3)
        print(f"Example 3 Result: {result_3}")

        browser.close()


if __name__ == "__main__":
    main() 