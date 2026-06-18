---
name: clean-error-messages
description: Ensures every CLI command and Flask route handles errors at the presentation boundary with a clean message, not a raw Python traceback. Use when adding a new CLI command, adding a new Flask route, auditing existing commands or routes, or when a traceback appears in user-facing output.
---

# Clean Error Messages at the Presentation Boundary

This skill covers how to audit and implement clean error handling at every
point where the program can fail visibly to a user.

---

## Why tracebacks must not reach users

- A non-technical user cannot act on a traceback. It is noise.
- A traceback reveals internal file paths, module names, and line numbers,
  which is a minor security exposure.
- A traceback printed to stdout corrupts any piped or captured output.
- It signals that the program was not finished — it is an oversight, not a feature.

---

## Step 1 — Audit every CLI command

For each `@click.command()` function, ask: what exceptions can `execute()`
raise that are not currently caught?

Read the use case's `execute()` method and identify every exception it can
raise at the top level (not just what it catches internally).

Common sources in this project:
- `IngestError` — from `DownloadAndIngestRegistersUseCase.execute()`
- `ScraperError` — from scraper calls not wrapped by the use case
- `SQLAlchemyError` — if a repository method raises and the use case does
  not convert it
- Unexpected `Exception` — network timeouts, disk full, permission denied

### CLI catch pattern

```python
from ocfl_spending.application.exceptions import IngestError

@click.command()
@click.pass_obj
def ingest_cmd(obj: dict[str, Any], force: bool) -> None:
    """Download new XLSX files and insert into the database."""
    try:
        result = obj["ingest_use_case"].execute(force=force, ...)
    except IngestError as exc:
        click.echo(f"\nIngest failed: {exc}", err=True)
        raise SystemExit(1) from exc
    click.echo(f"Done. ...")
```

Rules:
- Use `err=True` so the message goes to stderr, not stdout.
- Use `raise SystemExit(1) from exc` — not `sys.exit()`, not `return`.
- Log the exception with `exc_info=True` before raising if the use case
  did not already log it.
- Do not catch `Exception` broadly in commands — catch specific types and
  let truly unexpected exceptions propagate to a top-level handler.

---

## Step 2 — Audit every Flask route

For each route function, ask: what can the use case raise that the route
does not currently handle?

### Per-route catch (for expected application errors)

```python
from ocfl_spending.application.exceptions import SomeError

@bp.route("/transactions")
def transactions() -> str:
    try:
        result = use_case.execute(...)
    except SomeError as exc:
        current_app.logger.error("Query failed: %s", exc, exc_info=True)
        return render_template("error.html", message=str(exc)), 500
    return render_template("transactions.html", result=result)
```

### App-level catch-all (in create_app)

Register these in `create_app()` to catch anything that slips through
a route's own handler:

```python
from ocfl_spending.application.exceptions import IngestError, ScraperError

@app.errorhandler(Exception)
def handle_unexpected_error(exc: Exception) -> tuple[str, int]:
    """Catch-all: log and return a clean 500 page."""
    app.logger.error("Unhandled exception in request", exc_info=True)
    return render_template("error.html", message="An unexpected error occurred."), 500
```

The catch-all must:
- Log with `exc_info=True` so the traceback goes to the log, not the response.
- Return a rendered template, not a raw string containing the exception message.
- Never pass the full traceback or internal path to the template.

### The error template

Create `templates/error.html` if it does not exist. It must:
- Extend `base.html` so it matches the site style.
- Display the `message` variable.
- Never display a raw exception type or file path.

```html
{% extends "base.html" %}
{% block content %}
<div class="error-panel">
  <p class="error-label">ERROR</p>
  <p>{{ message }}</p>
  <p><a href="/">Return to dashboard</a></p>
</div>
{% endblock %}
```

---

## Step 3 — Checklist before marking a feature done

For every CLI command added or modified:

- [ ] All exceptions from `use_case.execute()` are caught by type.
- [ ] Each caught exception calls `click.echo(..., err=True)`.
- [ ] Each caught exception raises `SystemExit(1)` with a non-zero exit code.
- [ ] No bare `except Exception` without logging first.

For every Flask route added or modified:

- [ ] Route catches expected application exceptions explicitly.
- [ ] `create_app()` has a catch-all `@app.errorhandler(Exception)`.
- [ ] `app.run()` is called with `debug=False`.
- [ ] An `error.html` template exists and extends `base.html`.
- [ ] No exception message, type, or traceback is rendered directly into HTML.

---

## Step 4 — Testing clean error handling

Every catch block must be covered by a test. The test should verify:
1. The command exits with a non-zero code on failure.
2. The error message appears in stderr output.
3. The raw exception class name or traceback does not appear in the output.

```python
def test_ingest_shows_clean_error_on_failure(runner):
    ingest_uc = MagicMock()
    ingest_uc.execute.side_effect = IngestError("source unreachable")

    result = _invoke(runner, ["ingest"], ingest_uc=ingest_uc)

    assert result.exit_code != 0
    assert "source unreachable" in result.output
    assert "Traceback" not in result.output
    assert "IngestError" not in result.output
```

---

## Common mistakes

- Catching an exception and calling `click.echo()` but forgetting
  `raise SystemExit(1)` — the command exits 0 and looks like success.
- Using `print()` instead of `click.echo(..., err=True)` — goes to stdout,
  not stderr, and corrupts piped output.
- Catching `Exception` broadly in a use case and returning an empty result
  instead of raising — hides the failure entirely.
- Setting `debug=True` in `app.run()` — Flask shows a full interactive
  traceback in the browser on any error.

---

## See also

- Rule: `clean-error-messages.mdc`
- Error handling layer rules: `error-handling.mdc`
- Logging rules: `logging.mdc`
