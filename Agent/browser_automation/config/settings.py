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
SCREENSHOT_DIR = "C:\\Users\\kiran\\Work\\Github\\KiranPT03\\Automator\\screenshots"

# NATS settings
NATS_CONFIG = {
    "servers": ["nats://localhost:4222"],  # NATS server URLs
    "connection_timeout": 10,  # Connection timeout in seconds
    "max_reconnect_attempts": 5,
    "reconnect_time_wait": 2  # Time to wait between reconnect attempts (seconds)
}

# NATS subject and queue
NATS_SUBJECT = "testlab.testcase.executed"
NATS_QUEUE = "qg_browser_automation"

# PostgreSQL settings
POSTGRES_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "data_automator",
    "user": "user_automator",
    "password": "p@ssw0rd@Automator",
    "min_connections": 1,
    "max_connections": 10,
    "connection_timeout": 30  # seconds
}