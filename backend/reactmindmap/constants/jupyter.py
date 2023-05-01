import os

__all__ = [
    'JUPYTER_BASE_URL',
    'JUPYTER_PASSWORD'
]

JUPYTER_BASE_URL = os.environ.get("JUPYTER_BASE_URL", "http://example.com")
JUPYTER_PASSWORD = os.environ.get("JUPYTER_PASSWORD", "12345")