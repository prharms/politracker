---
name: venv-setup
description: Ensures a Python virtual environment exists and is correctly wired before writing any code. Use when starting a new project, when a user runs Python commands and gets import errors, when the project has no .venv, or when setting up dependencies for the first time. Also use proactively when the user begins any new Python project.
---

# Virtual Environment Setup Skill

## When to use this skill

Use this skill proactively whenever:

- A new Python project is being created (before writing any code).
- The user reports import errors, missing packages, or `command not found` for
  `pytest`, `alembic`, `flake8`, or similar tools.
- No `.venv` directory exists at the project root.
- The user asks how to install dependencies or run the project.
- Any `make.ps1` command fails because a binary is not found.

---

## Step 1 — Check whether a venv exists

```powershell
Test-Path .venv
```

If `False`, proceed to Step 2. If `True`, skip to Step 3.

---

## Step 2 — Create the venv

```powershell
python -m venv .venv
```

If `python` is not found, instruct the user to install Python 3.11 or later
from [python.org](https://www.python.org/downloads/) and ensure it is on their
`PATH`.

---

## Step 3 — Install project dependencies

If a `pyproject.toml` with a `[dev]` extras group exists:

```powershell
.venv\Scripts\pip install -e ".[dev]"
```

If the project uses a plain `requirements.txt`:

```powershell
.venv\Scripts\pip install -r requirements.txt
```

If both exist, install both.

---

## Step 4 — Verify the install

Run a quick sanity check to confirm the key tools are available:

```powershell
.venv\Scripts\python --version
.venv\Scripts\pytest.exe --version
```

If either command fails, report the error to the user and do not proceed.

---

## Step 5 — Ensure .venv is in .gitignore

Check that `.venv` is excluded from version control:

```powershell
Select-String -Path .gitignore -Pattern "^\.venv"
```

If not found, add it:

```powershell
Add-Content .gitignore "`n.venv"
```

---

## Step 6 — For new projects: create the minimum required files

Every new Python project must have all four of these before writing code:

- `.venv/` — virtual environment (not committed)
- `pyproject.toml` or `requirements.txt` — production dependencies
- A `[dev]` extras group or `requirements-dev.txt` — development tools
- `.env.example` — documents required environment variables (no real values)

If any of these are missing, create them before proceeding with implementation.

---

## Always use venv-local binaries

Never use bare `python`, `pip`, `pytest`, `alembic`, or `mypy` in terminal
commands or instructions. Always use the venv path:

```powershell
.venv\Scripts\python      # interpreter
.venv\Scripts\pip         # installer
.venv\Scripts\pytest.exe  # test runner
.venv\Scripts\alembic.exe # migrations
.venv\Scripts\mypy.exe    # type checker
.venv\Scripts\flake8.exe  # style linter
```

Or tell the user to run `.venv\Scripts\Activate.ps1` once for an interactive
session where bare commands resolve to the venv.

---

## Common mistakes to catch

- User runs `pip install` without a venv active — packages land in system
  Python. Fix: create venv, re-install into `.venv\Scripts\pip`.
- User runs `pytest` and gets `ModuleNotFoundError` — they are using system
  Python, not the venv. Fix: use `.venv\Scripts\pytest.exe`.
- CI pipeline uses `python` instead of `.venv\Scripts\python` — CI gets
  system packages, not project dependencies. Fix: update CI script.
- `.venv` was accidentally committed — remove it, add to `.gitignore`, and
  delete it from git history.

---

## See also

- `virtual-environment.mdc` rule — the zero-discretion policy for venv usage.
- `powershell-only.mdc` — PowerShell path syntax (`.venv\Scripts\`, not
  `.venv/bin/`).
- `project-inception` skill — full new-project discovery workflow that calls
  this skill at project setup.
