# Playwright Automation Framework

A robust Python-based browser automation framework using Playwright.

## Features

- Generic execution function for dynamic Playwright code execution
- Modular and maintainable project structure
- Configuration management
- Comprehensive error handling
- Unit and integration tests

## Project Structure

```
.
├── src/
│   ├── __init__.py
│   ├── browser/
│   │   ├── __init__.py
│   │   └── executor.py
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
├── tests/
│   ├── __init__.py
│   ├── test_executor.py
│   └── test_integration.py
├── config/
│   └── settings.py
├── reports/
├── requirements.txt
└── README.md
```

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install Playwright browsers:
```bash
playwright install
```

## Usage

```python
from src.browser.executor import execute_playwright_code
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    # Example code string
    code_string = """
    page.goto('https://example.com')
    page.fill('input[name="username"]', 'test_user')
    page.screenshot(path='screenshot.png')
    """
    
    execute_playwright_code(page, code_string)
    browser.close()
```

## Running Tests

```bash
pytest tests/
```

## Configuration

Edit `config/settings.py` to modify browser settings, timeouts, and other configurations.

## License

MIT 