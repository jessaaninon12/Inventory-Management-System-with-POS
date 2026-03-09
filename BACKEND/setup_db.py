#!/usr/bin/env python
"""
Database Setup Script for Haneus Cafe POS.

Run this ONCE before starting Django to choose your database
and generate the .env file automatically.

Usage:
    python setup_db.py
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

BANNER = """
╔══════════════════════════════════════════════════════╗
║       Haneus Cafe POS — Database Setup               ║
╚══════════════════════════════════════════════════════╝
"""

MENU = """
Select your database engine:

  [A] MySQL / MariaDB  (via XAMPP)
  [B] SQL Server       (via SSMS 19)

"""


def prompt(text, default=""):
    """Prompt the user for input with an optional default value."""
    if default:
        result = input(f"  {text} [{default}]: ").strip()
        return result if result else default
    return input(f"  {text}: ").strip()


def setup_mysql():
    """Collect MySQL connection details and return env lines."""
    print("\n── MySQL / MariaDB (XAMPP) ──────────────────────────")
    print("  Make sure XAMPP is running and the database exists.")
    print("  Default: root user, no password, port 3306.\n")

    db_name = prompt("Database name", "Haneus-Inventory")
    db_user = prompt("Username", "root")
    db_pass = prompt("Password (leave blank for none)", "")
    db_host = prompt("Host", "127.0.0.1")
    db_port = prompt("Port", "3306")

    return {
        "DB_ENGINE": "mysql",
        "DB_NAME": db_name,
        "DB_USER": db_user,
        "DB_PASSWORD": db_pass,
        "DB_HOST": db_host,
        "DB_PORT": db_port,
    }


def setup_mssql():
    """Collect SQL Server connection details and return env lines."""
    print("\n── SQL Server (SSMS 19) ────────────────────────────")
    print("  Make sure SQL Server is running and the database exists.")
    print("  For named instances use: localhost\\SQLEXPRESS\n")

    db_name = prompt("Database name", "HaneusCafeDB")
    db_user = prompt("Username", "sa")
    db_pass = prompt("Password", "")
    db_host = prompt("Host (e.g. localhost or localhost\\SQLEXPRESS)", "localhost")
    db_port = prompt("Port", "1433")
    db_driver = prompt("ODBC Driver", "ODBC Driver 17 for SQL Server")

    return {
        "DB_ENGINE": "mssql",
        "DB_NAME": db_name,
        "DB_USER": db_user,
        "DB_PASSWORD": db_pass,
        "DB_HOST": db_host,
        "DB_PORT": db_port,
        "DB_MSSQL_DRIVER": db_driver,
    }


def write_env(config):
    """Write the .env file from config dict."""
    lines = [
        "# ── Django ──────────────────────────────────────────",
        "DJANGO_SECRET_KEY=change-this-in-production",
        "DJANGO_DEBUG=True",
        "DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1",
        "",
        f"# ── Database ({config['DB_ENGINE']}) ─────────────────────────────",
    ]

    for key, value in config.items():
        lines.append(f"{key}={value}")

    lines.append("")
    lines.append("# ── Frontend (for reference) ────────────────────────")
    lines.append("API_BASE_URL=http://localhost:8000")
    lines.append("")

    ENV_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n  .env file created at: {ENV_FILE}")


def print_next_steps(engine):
    """Show the user what to do next."""
    print("\n── Next Steps ──────────────────────────────────────\n")

    if engine == "mysql":
        print("  1. Make sure XAMPP Apache + MySQL are running.")
        print("  2. Create the database in phpMyAdmin if not done:")
        print('       CREATE DATABASE `Haneus-Inventory`;')
        print("  3. Install the MySQL driver:")
        print("       pip install mysqlclient")
    elif engine == "mssql":
        print("  1. Make sure SQL Server is running (check SSMS).")
        print("  2. Create the database in SSMS if not done:")
        print("       CREATE DATABASE HaneusCafeDB;")
        print("  3. Install the SQL Server driver:")
        print("       pip install mssql-django pyodbc")

    print()
    print("  Then run:")
    print("    python manage.py makemigrations api")
    print("    python manage.py makemigrations infrastructure")
    print("    python manage.py migrate")
    print("    python manage.py runserver")
    print()
    print("  API docs will be available at:")
    print("    http://localhost:8000/api/docs/")
    print()


def main():
    print(BANNER)

    if ENV_FILE.exists():
        overwrite = input("  .env already exists. Overwrite? (y/N): ").strip().lower()
        if overwrite != "y":
            print("  Aborted. Existing .env kept.")
            sys.exit(0)

    print(MENU)
    choice = input("  Your choice (A/B): ").strip().upper()

    if choice == "A":
        config = setup_mysql()
    elif choice == "B":
        config = setup_mssql()
    else:
        print(f"  Invalid choice: {choice}")
        sys.exit(1)

    write_env(config)
    print_next_steps(config["DB_ENGINE"])


if __name__ == "__main__":
    main()
