"""
Configuration settings for the Playwright automation framework.
"""

from typing import Dict, Any

# Browser settings
BROWSER_CONFIG: Dict[str, Any] = {
    "headless": False,
    "slow_mo": 50,
    "viewport": {"width": 1920, "height": 1080},
}

# Timeout settings (in milliseconds)
TIMEOUTS: Dict[str, int] = {
    "navigation": 30000,
    "element": 10000,
    "default": 5000,
}

# Screenshot settings
SCREENSHOT_CONFIG: Dict[str, Any] = {
    "full_page": True,
    "quality": 90,
}

# Report settings
REPORT_CONFIG: Dict[str, Any] = {
    "output_dir": "reports",
    "screenshot_dir": "reports/screenshots",
    "video_dir": "reports/videos",
}

# Error handling settings
ERROR_HANDLING: Dict[str, Any] = {
    "retry_attempts": 3,
    "retry_delay": 1000,  # milliseconds
    "log_errors": True,
} 