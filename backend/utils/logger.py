"""
Logger utility that conditionally logs based on environment
In production, all logging is disabled by default
"""
import os
from typing import Any


def _should_log() -> bool:
    """Check if logging should be enabled"""
    environment = os.getenv("ENVIRONMENT", "development").lower()
    enable_logging = os.getenv("ENABLE_LOGGING", "false").lower() == "true"

    # Enable logging if in development OR if explicitly enabled via env var
    return environment == "development" or enable_logging


class Logger:
    """Logger that respects environment settings"""

    def __init__(self):
        self.enabled = _should_log()

    def log(self, *args: Any, **kwargs: Any) -> None:
        """Print log message if logging is enabled"""
        if self.enabled:
            print(*args, **kwargs)

    def error(self, *args: Any, **kwargs: Any) -> None:
        """Print error message if logging is enabled"""
        if self.enabled:
            print("[ERROR]", *args, **kwargs)

    def warn(self, *args: Any, **kwargs: Any) -> None:
        """Print warning message if logging is enabled"""
        if self.enabled:
            print("[WARN]", *args, **kwargs)

    def info(self, *args: Any, **kwargs: Any) -> None:
        """Print info message if logging is enabled"""
        if self.enabled:
            print("[INFO]", *args, **kwargs)


# Create singleton instance
logger = Logger()
