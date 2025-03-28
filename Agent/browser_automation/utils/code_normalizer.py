"""
Utilities for normalizing and cleaning Playwright code.
"""
import re
import logging

logger = logging.getLogger(__name__)

def normalize_playwright_code(code):
    """
    Convert common method naming variations to correct Playwright syntax.
    
    Args:
        code: The code to normalize
        
    Returns:
        str: Normalized code
    """
    # Remove imports and context managers
    code = remove_imports_and_context(code)
    
    # Convert camelCase to snake_case for Playwright methods
    replacements = {
        'getByRole': 'get_by_role',
        'getByText': 'get_by_text',
        'getByLabel': 'get_by_label',
        'getByPlaceholder': 'get_by_placeholder',
        'getByTestId': 'get_by_test_id',
        'getByAltText': 'get_by_alt_text',
        'getByTitle': 'get_by_title',
        'click()': 'click()',
        'type(': 'fill('
    }
    
    for old, new in replacements.items():
        code = code.replace(old, new)
    
    # Remove async/await keywords
    code = code.replace('async ', '').replace('await ', '')
    
    # Clean up any extra whitespace
    code = re.sub(r'\n\s*\n', '\n\n', code)
    code = code.strip()
    
    logger.debug(f"Normalized code: {code}")
    return code

def remove_imports_and_context(code):
    """
    Remove Playwright imports and context managers from code.
    
    Args:
        code: The code to clean
        
    Returns:
        str: Cleaned code
    """
    # Remove import statements
    code = re.sub(r'from playwright\.\w+_api import \w+_playwright.*?\n', '', code)
    
    # Remove context managers
    code = re.sub(r'with sync_playwright\(\) as playwright:.*?\n', '', code)
    code = re.sub(r'async with async_playwright\(\) as playwright:.*?\n', '', code)
    
    # Remove run statements
    code = re.sub(r'run\(playwright\)', '', code)
    code = re.sub(r'asyncio\.run\(main\(\)\)', '', code)
    
    # Remove browser and page creation
    code = re.sub(r'browser = p\.chromium\.launch\(.*?\)', '', code, flags=re.DOTALL)
    code = re.sub(r'page = browser\.new_page\(.*?\)', '', code, flags=re.DOTALL)
    code = re.sub(r'browser\.close\(\)', '', code)
    
    return code