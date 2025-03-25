"""
Test module for the Playwright code executor.
"""
import os
import pytest
from playwright.sync_api import sync_playwright
from src.browser.executor import execute_playwright_code


@pytest.fixture(scope="module")
def browser():
    """Fixture to manage browser instance."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def page(browser):
    """Fixture to manage page instance."""
    page = browser.new_page()
    yield page
    page.close()


def test_simple_navigation(page):
    """Test simple page navigation."""
    code_string = """
    page.goto('https://example.com')
    result = page.title()
    """
    result = execute_playwright_code(page, code_string)
    assert result["success"]
    assert "Example Domain" in result["output"]


def test_form_interaction(page):
    """Test form interaction."""
    code_string = """
    page.goto('https://example.com')
    page.fill('input[name="username"]', 'test_user')
    page.fill('input[name="password"]', 'test_pass')
    page.click('button[type="submit"]')
    result = page.url
    """
    result = execute_playwright_code(page, code_string)
    assert result["success"]


def test_screenshot(page):
    """Test taking a screenshot."""
    code_string = """
    page.goto('https://example.com')
    page.screenshot(path='test_screenshot.png')
    result = os.path.exists('test_screenshot.png')
    """
    result = execute_playwright_code(page, code_string)
    assert result["success"]
    assert result["output"]
    os.remove('test_screenshot.png')


def test_invalid_code(page):
    """Test handling of invalid code."""
    code_string = "invalid python code"
    result = execute_playwright_code(page, code_string)
    assert not result["success"]
    assert "error" in result


def test_timeout_handling(page):
    """Test timeout handling."""
    code_string = """
    page.goto('https://example.com')
    page.wait_for_selector('.non-existent-element', timeout=1000)
    """
    result = execute_playwright_code(page, code_string)
    assert not result["success"]
    assert "Timeout error" in result["error"] 