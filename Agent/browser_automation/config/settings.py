"""
Configuration settings for the browser automation project.
"""

# Browser settings
BROWSER_CONFIG = {
    "headless": False,
    "args": ['--start-maximized', '--start-fullscreen', '--kiosk']
}

# Context settings
CONTEXT_CONFIG = {
    "no_viewport": True
}

# AI settings
GEMINI_API_KEY = "AIzaSyCnF-imPoBc_8t88fPoZnSdc3P-RWSNzzU"
GEMINI_MODEL = "gemini-2.0-flash-exp-image-generation"

# Retry settings
MAX_RETRY_COUNT = 4

# Screenshot settings
SCREENSHOT_DIR = "screenshots"