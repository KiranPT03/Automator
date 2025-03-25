"""
Module for executing Playwright code dynamically.
"""

import ast
import inspect
from typing import Any, Dict, Optional
from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError

from config.settings import ERROR_HANDLING, TIMEOUTS


class PlaywrightCodeExecutor:
    """A class to handle dynamic execution of Playwright code."""

    def __init__(self, page: Page):
        """
        Initialize the executor with a Playwright page object.

        Args:
            page (Page): The Playwright page object to execute code on.
        """
        self.page = page
        self._setup_page_methods()

    def _setup_page_methods(self) -> None:
        """Set up available page methods for execution."""
        self.available_methods = {
            name: method for name, method in inspect.getmembers(self.page)
            if not name.startswith('_') and callable(method)
        }

    def _validate_code(self, code_string: str) -> bool:
        """
        Validate the provided code string.

        Args:
            code_string (str): The code string to validate.

        Returns:
            bool: True if the code is valid, False otherwise.
        """
        try:
            ast.parse(code_string)
            return True
        except SyntaxError:
            return False

    def _execute_with_retry(self, func: callable, *args, **kwargs) -> Any:
        """
        Execute a function with retry logic.

        Args:
            func (callable): The function to execute.
            *args: Positional arguments for the function.
            **kwargs: Keyword arguments for the function.

        Returns:
            Any: The result of the function execution.

        Raises:
            Exception: If all retry attempts fail.
        """
        last_error = None
        for attempt in range(ERROR_HANDLING["retry_attempts"]):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_error = e
                if attempt < ERROR_HANDLING["retry_attempts"] - 1:
                    self.page.wait_for_timeout(ERROR_HANDLING["retry_delay"])
                continue
        raise last_error

    def execute_playwright_code(self, code_string: str) -> Dict[str, Any]:
        """
        Execute Playwright code dynamically.

        Args:
            code_string (str): The Playwright code to execute.

        Returns:
            Dict[str, Any]: A dictionary containing execution results and any errors.

        Raises:
            ValueError: If the code string is invalid.
            Exception: If execution fails after all retry attempts.
        """
        if not self._validate_code(code_string):
            raise ValueError("Invalid Python code provided")

        result = {
            "success": False,
            "error": None,
            "output": None
        }

        try:
            # Create a local namespace with the page object
            local_namespace = {"page": self.page}
            
            # Execute the code string
            exec(code_string, {}, local_namespace)
            
            result["success"] = True
            result["output"] = local_namespace.get("result", None)

        except PlaywrightTimeoutError as e:
            result["error"] = f"Timeout error: {str(e)}"
        except Exception as e:
            result["error"] = f"Execution error: {str(e)}"

        return result


def execute_playwright_code(page: Page, code_string: str) -> Dict[str, Any]:
    """
    Execute Playwright code dynamically using a page object.

    Args:
        page (Page): The Playwright page object to execute code on.
        code_string (str): The Playwright code to execute.

    Returns:
        Dict[str, Any]: A dictionary containing execution results and any errors.

    Example:
        >>> code = '''
        ... page.goto('https://example.com')
        ... page.fill('input[name="username"]', 'test_user')
        ... '''
        >>> result = execute_playwright_code(page, code)
    """
    executor = PlaywrightCodeExecutor(page)
    return executor.execute_playwright_code(code_string) 