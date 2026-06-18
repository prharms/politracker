---
name: flask-app-factory
description: >-
  Creates a Flask application using the app factory pattern, wired for hexagonal
  architecture so that the presentation layer never imports the container or
  infrastructure. Use when starting a new Flask app, adding Flask to an existing
  hexagonal project, adding a new blueprint, configuring error handlers, or
  setting up Flask test clients. Covers app factory signature, blueprint
  registration, config management, error handlers, static/template layout,
  and the testing fixture pattern.
---

# Flask App Factory (Hexagonal Architecture)

## The non-negotiable constraint

`create_app` lives in `presentation/web/app.py`. It receives its dependencies as
parameters — it never imports `container`, `infrastructure`, or any concrete
repository or use case class. All wiring happens in `main.py` before `create_app`
is called.

If you find yourself writing `from your_package import container` inside `app.py`
or any route file, stop. Read the `lint-imports-setup` skill first.

---

## File layout

```
your_package/
    main.py                          # composition root — calls create_app
    presentation/
        web/
            app.py                   # create_app factory
            routes.py                # Blueprint(s)
            templates/
                base.html
                *.html
            static/
                css/
                js/
```

---

## Step 1 — The app factory

```python
# presentation/web/app.py
"""Flask application factory."""

from typing import Any

from flask import Flask
from sqlalchemy import Engine

from your_package.presentation.web.routes import web_bp


def create_app(engine: Engine, use_case_factories: dict[str, Any]) -> Flask:
    """Create and configure the Flask application.

    Parameters
    ----------
    engine:
        SQLAlchemy engine — stored in app.config for per-request use.
    use_case_factories:
        Dict of callables keyed by use-case name. Routes call
        ``factories["foo"](engine)`` to build a fresh use case per request
        without importing the container.
    """
    app = Flask(__name__, template_folder="templates", static_folder="static")
    app.config["ENGINE"] = engine
    app.config["USE_CASE_FACTORIES"] = use_case_factories
    app.config["SECRET_KEY"] = _require_env("SECRET_KEY")

    app.register_blueprint(web_bp)
    _register_error_handlers(app)
    return app


def _require_env(key: str) -> str:
    """Return an environment variable or raise if absent."""
    import os
    value = os.environ.get(key)
    if not value:
        raise RuntimeError(f"Required environment variable not set: {key}")
    return value
```

**Rules:**
- `create_app` accepts typed parameters — no `**kwargs`, no `config` dict
- Every secret comes from environment variables via `_require_env`, never hardcoded
- `template_folder` and `static_folder` are explicit — do not rely on Flask defaults
  when the app module is not at the package root

---

## Step 2 — Blueprints

One blueprint per feature area. Register all blueprints in `create_app`.

```python
# presentation/web/routes.py
"""Flask routes for the web dashboard."""

from typing import Any

from flask import Blueprint, current_app, render_template, request

from your_package.application.filters import MyFilters

web_bp = Blueprint("web", __name__)


@web_bp.route("/")
def dashboard() -> str:
    """Render the main dashboard."""
    factories: dict[str, Any] = current_app.config["USE_CASE_FACTORIES"]
    engine = current_app.config["ENGINE"]
    use_case = factories["summary"](engine)
    stats = use_case.execute()
    return render_template("dashboard.html", stats=stats.to_dict())


@web_bp.route("/items")
def items() -> str:
    """Render the filterable items table."""
    factories: dict[str, Any] = current_app.config["USE_CASE_FACTORIES"]
    engine = current_app.config["ENGINE"]
    use_case = factories["query"](engine)
    filters = _parse_filters(request.args)
    result = use_case.execute(filters)
    return render_template("items.html", result=result.to_dict(), args=request.args)
```

**Rules:**
- Routes import from `application` (filters, exceptions) and `flask` only
- Routes never import `container`, repositories, or domain entities directly
- Data passed to `render_template` is always `dto.to_dict()` — never a raw DTO or entity
- Each route function has a one-line docstring

---

## Step 3 — Error handlers

Register at the app level, not on individual blueprints.

```python
def _register_error_handlers(app: Flask) -> None:
    """Register application-wide HTTP error handlers."""

    @app.errorhandler(404)
    def not_found(e: Exception) -> tuple[str, int]:
        """Render a 404 page."""
        return render_template("errors/404.html"), 404

    @app.errorhandler(500)
    def internal_error(e: Exception) -> tuple[str, int]:
        """Render a 500 page."""
        return render_template("errors/500.html"), 500
```

For JSON APIs, return `jsonify({"error": str(e)})` instead of `render_template`.

---

## Step 4 — Base template

Every page extends `base.html`. Define blocks that child templates fill:

```html
<!-- presentation/web/templates/base.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}App{% endblock %}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">
    {% block extra_css %}{% endblock %}
</head>
<body>
    <nav>{% block nav %}{% endblock %}</nav>
    <main>{% block content %}{% endblock %}</main>
    {% block extra_js %}{% endblock %}
</body>
</html>
```

Child templates:

```html
{% extends "base.html" %}
{% block title %}Dashboard{% endblock %}
{% block content %}
  ...
{% endblock %}
```

---

## Step 5 — Composition root wiring

`main.py` creates the engine, builds the factory dict, and calls `create_app`.
The app never knows where the factories come from.

```python
# main.py (excerpt)
def make_flask_app(engine: Engine) -> Any:
    """Create the Flask app with use case factories wired from the container."""
    from your_package import container
    from your_package.presentation.web.app import create_app

    factories: dict[str, Any] = {
        "query": container.get_query_use_case,
        "summary": container.get_summary_use_case,
    }
    return create_app(engine=engine, use_case_factories=factories)
```

The `serve` CLI command calls `make_flask_app`, not `create_app` directly:

```python
@click.command()
@click.pass_obj
def serve_cmd(obj: dict[str, Any], port: int | None) -> None:
    """Launch the Flask dashboard."""
    import os
    flask_port = port or int(os.environ.get("FLASK_PORT", "5000"))
    app = obj["flask_app_factory"]()
    app.run(host="127.0.0.1", port=flask_port, debug=False)
```

**Never use `host="0.0.0.0"`** for a CLI-launched local server — bandit flags it
(B104). Use `127.0.0.1`.

---

## Step 6 — Testing

Pass mock factories directly to `create_app`. No container patching needed.

```python
# tests/unit/test_routes.py
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from your_package.presentation.web.app import create_app


def _make_app(query_uc=None, summary_uc=None):
    """Create a test Flask app with injected mock use cases."""
    engine = create_engine("sqlite:///:memory:")
    q = query_uc or MagicMock()
    s = summary_uc or MagicMock()
    app = create_app(
        engine=engine,
        use_case_factories={
            "query": lambda e: q,
            "summary": lambda e: s,
        },
    )
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = "test-secret"
    return app


class TestDashboardRoute:
    def test_returns_200(self):
        stats_uc = MagicMock()
        stats_uc.execute.return_value = MagicMock(to_dict=lambda: {})
        client = _make_app(summary_uc=stats_uc).test_client()
        assert client.get("/").status_code == 200

    def test_calls_use_case(self):
        stats_uc = MagicMock()
        stats_uc.execute.return_value = MagicMock(to_dict=lambda: {})
        client = _make_app(summary_uc=stats_uc).test_client()
        client.get("/")
        stats_uc.execute.assert_called_once()
```

---

## Config checklist

| Config key | Set in | Notes |
|---|---|---|
| `ENGINE` | `create_app` parameter | SQLAlchemy Engine from `main.py` |
| `USE_CASE_FACTORIES` | `create_app` parameter | Dict of callables from `main.py` |
| `SECRET_KEY` | `_require_env("SECRET_KEY")` | Must be in `.env`; never hardcoded |
| `TESTING` | Test fixture only | Set to `True` in `_make_app` helper |

---

## Pre-launch checklist

- [ ] `create_app` has no import of `container` or `infrastructure`
- [ ] All blueprints registered in `create_app`
- [ ] Error handlers registered via `_register_error_handlers`
- [ ] `SECRET_KEY` read from environment, absent raises `RuntimeError`
- [ ] `host="127.0.0.1"` in `app.run()` — not `0.0.0.0`
- [ ] `debug=False` in `app.run()` — debug mode is never on in CLI launch
- [ ] All route functions have docstrings
- [ ] All data to `render_template` is `dto.to_dict()` — no raw entities
- [ ] Route tests use `_make_app(factories)` fixture — no container patching

## See also

- `lint-imports-setup` — establishing the contracts that enforce these rules
- `hexagonal-feature` — adding a new route + use case end-to-end
- `sqlite-sqlalchemy-core` — the `Engine` that `create_app` receives
