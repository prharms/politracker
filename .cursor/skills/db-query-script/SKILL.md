---
name: db-query-script
description: Writes a Python script in tools/ that queries the PostgreSQL database using credentials from .env. Use when you need to inspect live data, look up constraint names, audit schema state, debug a migration, or answer any question that requires querying the database directly. Never use shell SQL commands or psql — always write a Python script using this pattern.
---

# Database Query Script

Scripts that access the database live in `tools/`. They use `psycopg2` and
load credentials from `.env` via `python-dotenv`. They are never part of the
application layer.

---

## Script structure

```python
"""
One-line description of what this script does.

Run from the project root:
    .venv\Scripts\python.exe tools\your_script.py
"""

import os
from pathlib import Path
from typing import Any

import psycopg2
from dotenv import load_dotenv


def load_database_url() -> str:
    """Load DATABASE_URL from .env file."""
    env_path = Path(".env")
    if not env_path.exists():
        print("[ERROR] .env file not found")
        print("[ERROR] Run this script from the project root directory")
        raise FileNotFoundError(".env file not found")

    load_dotenv(env_path)

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("[ERROR] DATABASE_URL not found in .env")
        raise ValueError("DATABASE_URL not configured")

    return database_url


def main() -> int:
    """Main entry point."""
    try:
        database_url = load_database_url()
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        # --- your query here ---
        cursor.execute("""
            SELECT ...
            FROM ...
            WHERE ...
        """, (param,))

        for row in cursor.fetchall():
            print(row)
        # -----------------------

        cursor.close()
        conn.close()
        return 0

    except Exception as e:
        print(f"[ERROR] {e}")
        return 1


if __name__ == "__main__":
    exit(main())
```

---

## Rules

- Always place scripts in `tools/`, never in `irs_data/`.
- Always use `load_dotenv(Path(".env"))` — never hardcode credentials.
- Always use parameterised queries: `cursor.execute("... WHERE x = %s", (val,))`.
  Never use f-strings or string concatenation to build SQL.
- Always run from the project root so `.env` is found:
  ```powershell
  cd c:\Projects\prhrt\irs-data; .venv\Scripts\python.exe tools\your_script.py
  ```
- Use `print("[INFO] ...")`, `print("[SUCCESS] ...")`, `print("[ERROR] ...")` for output.
- Always close the cursor and connection when done.

---

## Common queries

### List constraints on a table

```python
cursor.execute("""
    SELECT conname, contype, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = %s::regclass
    ORDER BY contype, conname
""", ("public.filings",))
for row in cursor.fetchall():
    print(row)
```

### List columns and types

```python
cursor.execute("""
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = %s AND table_name = %s
    ORDER BY ordinal_position
""", ("public", "filings"))
for row in cursor.fetchall():
    print(row)
```

### Check current Alembic revision

```python
cursor.execute("SELECT version_num FROM alembic_version")
print(cursor.fetchone())
```

---

## When to use this skill

- Before writing a migration: look up the real constraint name.
- After a failed migration: inspect the current table state.
- Any time a question can only be answered by querying the live database.
- Debugging data quality issues.

Do not answer schema or data questions from memory. Write the script, run it,
read the output, then answer.
