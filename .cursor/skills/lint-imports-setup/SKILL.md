---
name: lint-imports-setup
description: >-
  Sets up import-linter with strict hexagonal architecture contracts and wires a
  composition root (main.py) so that the presentation layer never imports the
  container or infrastructure. Use when starting a new hexagonal project, adding
  import-linter to an existing project, or when lint-imports is failing because
  routes import the container.
---

# Hexagonal Architecture: Import-Linter Setup and Composition Root

## The core rule

`presentation` never imports `container` or `infrastructure` — not directly, not
transitively. `container` is called from exactly one place: `main.py`, which lives
at the package root outside all layer subfolders.

---

## Step 1 — Install import-linter

```toml
# pyproject.toml [project.optional-dependencies] dev section
"import-linter>=2.1",
```

## Step 2 — Write the four contracts

```toml
# pyproject.toml
[tool.importlinter]
root_packages = ["your_package"]

[[tool.importlinter.contracts]]
name = "Domain is independent"
type = "forbidden"
source_modules = ["your_package.domain"]
forbidden_modules = [
    "your_package.application",
    "your_package.infrastructure",
    "your_package.presentation",
    "your_package.container",
]

[[tool.importlinter.contracts]]
name = "Application does not import infrastructure or presentation"
type = "forbidden"
source_modules = ["your_package.application"]
forbidden_modules = [
    "your_package.infrastructure",
    "your_package.presentation",
    "your_package.container",
]

[[tool.importlinter.contracts]]
name = "Infrastructure does not import presentation or container"
type = "forbidden"
source_modules = ["your_package.infrastructure"]
forbidden_modules = [
    "your_package.presentation",
    "your_package.container",
]

[[tool.importlinter.contracts]]
name = "Presentation does not import infrastructure or container"
type = "forbidden"
source_modules = ["your_package.presentation"]
forbidden_modules = ["your_package.infrastructure", "your_package.container"]
```

Note: `your_package.main` is not listed as a source in any contract — it is the
composition root and is intentionally unrestricted.

---

## Step 3 — Create main.py (composition root)

**File:** `your_package/main.py` — outside all layer subfolders.

```python
"""Composition root: wires all layers and serves as the CLI entry point."""

import logging
from typing import Any

import click
from dotenv import load_dotenv
from sqlalchemy import Engine

from your_package.presentation.cli import bar_cmd, foo_cmd

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")


def make_flask_app(engine: Engine) -> Any:
    """Create the Flask app with use case factories wired from the container."""
    from your_package import container
    from your_package.presentation.web.app import create_app

    factories: dict[str, Any] = {
        "foo": container.get_foo_use_case,
        "bar": container.get_bar_use_case,
    }
    return create_app(engine=engine, use_case_factories=factories)


@click.group()
@click.pass_context
def cli(ctx: click.Context) -> None:
    """your-package CLI."""
    from your_package import container

    ctx.ensure_object(dict)
    engine = container.get_engine()
    ctx.obj["engine"] = engine
    ctx.obj["foo_use_case"] = container.get_foo_use_case(engine)
    ctx.obj["flask_app_factory"] = lambda: make_flask_app(engine)


cli.add_command(foo_cmd, "foo")
cli.add_command(bar_cmd, "bar")
```

**pyproject.toml entry point:**
```toml
[project.scripts]
your-package = "your_package.main:cli"
```

---

## Step 4 — Flask app factory

**File:** `your_package/presentation/web/app.py`

```python
"""Flask application factory."""

from typing import Any
from flask import Flask
from sqlalchemy import Engine
from your_package.presentation.web.routes import web_bp


def create_app(engine: Engine, use_case_factories: dict[str, Any]) -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__, template_folder="templates")
    app.config["ENGINE"] = engine
    app.config["USE_CASE_FACTORIES"] = use_case_factories
    app.register_blueprint(web_bp)
    return app
```

No container import. No `_get_engine()` helper. The engine comes from `main.py`.

---

## Step 5 — Routes consume factories

```python
# your_package/presentation/web/routes.py
from typing import Any
from flask import Blueprint, current_app, render_template

web_bp = Blueprint("web", __name__)

@web_bp.route("/foo")
def foo_index() -> str:
    """Render the foo page."""
    factories: dict[str, Any] = current_app.config["USE_CASE_FACTORIES"]
    engine = current_app.config["ENGINE"]
    use_case = factories["foo"](engine)
    result = use_case.execute()
    return render_template("foo.html", result=result.to_dict())
```

---

## Step 6 — CLI commands use pass_obj

```python
# your_package/presentation/cli.py
from typing import Any
import click

@click.command()
@click.pass_obj
def foo_cmd(obj: dict[str, Any]) -> None:
    """Run the foo command."""
    result = obj["foo_use_case"].execute()
    click.echo(f"Done: {result}")

@click.command()
@click.option("--port", default=None, type=int)
@click.pass_obj
def serve_cmd(obj: dict[str, Any], port: int | None) -> None:
    """Launch the Flask dashboard."""
    import os
    flask_port = port or int(os.environ.get("FLASK_PORT", "5000"))
    app = obj["flask_app_factory"]()
    app.run(host="127.0.0.1", port=flask_port, debug=False)
```

---

## Step 7 — Test patterns

**Route tests** — pass mock factories directly to `create_app`, no container patching:

```python
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from your_package.presentation.web.app import create_app

def _make_app(foo_uc=None):
    engine = create_engine("sqlite:///:memory:")
    uc = foo_uc or MagicMock()
    app = create_app(engine=engine, use_case_factories={"foo": lambda e: uc})
    app.config["TESTING"] = True
    return app
```

**CLI tests** — patch container functions so the group callback does not touch real I/O:

```python
from unittest.mock import MagicMock, patch
from your_package.main import cli

def _invoke(runner, args, foo_uc=None):
    with patch("your_package.container.get_engine", return_value=MagicMock()):
        with patch("your_package.container.get_foo_use_case", return_value=foo_uc or MagicMock()):
            with patch("your_package.main.make_flask_app", return_value=MagicMock()):
                return runner.invoke(cli, args)
```

---

## Verify contracts pass

```powershell
.venv\Scripts\lint-imports.exe
# Expected: all contracts KEPT, 0 broken
```

If a contract is broken, the output shows the import chain. Fix the chain — never
add `ignore_imports` to mask a real violation.
