"""
Database context utility — infrastructure layer.

Provides helpers for transaction management and connection verification.
Django handles connection pooling internally; this module exposes a thin
convenience API used by repositories when they need explicit transactions.
"""

from django.db import connection, transaction


def verify_connection():
    """Return True if the database is reachable."""
    try:
        connection.ensure_connection()
        return True
    except Exception:
        return False


def get_db_info():
    """Return a dict with basic database metadata."""
    db_settings = connection.settings_dict
    return {
        "engine": db_settings.get("ENGINE", ""),
        "name": db_settings.get("NAME", ""),
        "host": db_settings.get("HOST", ""),
        "port": db_settings.get("PORT", ""),
    }


def run_in_transaction(func, *args, **kwargs):
    """
    Execute *func* inside an atomic database transaction.

    Usage::

        result = run_in_transaction(my_service_method, arg1, arg2)
    """
    with transaction.atomic():
        return func(*args, **kwargs)
