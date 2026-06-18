---
name: progress-indicators
description: Implementation patterns for adding progress indicators to CLI commands in this project. Use when adding a new long-running CLI command, when a command violates the progress-indicators rule, or when the user asks why a command runs silently. Covers click.progressbar, per-item echo, and the callback pattern for use cases that loop internally.
---

# Progress Indicators

This skill covers how to add progress feedback to CLI commands without
violating the hexagonal architecture — specifically, without letting Click
(a presentation concern) leak into the use case (application layer).

---

## The architectural problem

The use case owns the processing loop. The CLI owns the progress bar.
These cannot see each other directly — `application` must not import Click,
and `presentation` must not own business logic.

The solution is a **progress callback**: the CLI passes a plain Python
function into the use case. The use case calls it after each unit of work.
The CLI decides what that function does (tick a progress bar, print a line).
The use case does not know or care — it just calls a callable.

---

## Pattern 1 — click.progressbar (total count known upfront)

Use this when the use case can report total work before starting. The
typical approach: split discovery from processing so the CLI can size
the bar before the loop begins.

### Use case changes

Add an optional `on_progress` callback parameter to `execute()`:

```python
from collections.abc import Callable

def execute(
    self,
    force: bool = False,
    on_progress: Callable[[str], None] | None = None,
) -> dict[str, int]:
    """Run the ingest process."""
    ...
    for file_info in available:
        # ... do the work ...
        if on_progress:
            on_progress(file_info.filename)
```

The callback receives the filename (or any string label) after each file
is processed. The use case never imports Click.

### CLI changes

```python
@click.command()
@click.option("--force", is_flag=True, default=False)
@click.pass_obj
def ingest_cmd(obj: dict[str, Any], force: bool) -> None:
    """Download new XLSX files and insert into the database."""
    use_case = obj["ingest_use_case"]

    # Discover how many files exist so the bar can be sized.
    total = use_case.count_available()  # or expose list length before looping

    with click.progressbar(
        length=total,
        label="Ingesting",
        item_show_func=lambda f: f" {f}" if f else "",
    ) as bar:
        def on_progress(filename: str) -> None:
            bar.update(1, filename)

        result = use_case.execute(force=force, on_progress=on_progress)

    click.echo(
        f"Done.  Downloaded: {result['downloaded']}  "
        f"Skipped: {result['skipped']}  "
        f"Rows inserted: {result['total_rows']}  "
        f"Errors: {result['errors']}"
    )
```

What the user sees:

```
Ingesting   [################----]  80%  00:01:23  BCC_2024-03-15.xlsx
```

### click.progressbar parameters used here

- **`length`** — total number of items, used to calculate the percentage
  and estimated time remaining.
- **`label`** — text shown to the left of the bar.
- **`item_show_func`** — a function that takes the most recently passed
  item and returns a string to display next to the bar. Used to show
  the current filename.
- **`bar.update(1, filename)`** — advances the bar by 1 step and passes
  `filename` to `item_show_func`.

---

## Pattern 2 — per-item echo (total count unknown)

Use this when the total cannot be known before the loop starts, or when
the operation is heterogeneous enough that a percentage would be misleading.

```python
@click.command()
@click.pass_obj
def ingest_cmd(obj: dict[str, Any], force: bool) -> None:
    """Download new XLSX files and insert into the database."""
    count = 0

    def on_progress(filename: str) -> None:
        nonlocal count
        count += 1
        click.echo(f"  [{count}] {filename}")

    result = obj["ingest_use_case"].execute(force=force, on_progress=on_progress)
    click.echo(f"Done. {result['downloaded']} files, {result['total_rows']:,} rows.")
```

What the user sees:

```
  [1] BCC_2023-10-15.xlsx
  [2] BCC_2023-11-01.xlsx
  [3] BCC_2024-01-15.xlsx
  ...
Done. 52 files, 184,203 rows.
```

---

## Pattern 3 — spinner for indivisible operations

Use this for operations that cannot be broken into discrete ticks
(e.g. a single long database query, a large file download).

```python
import sys
import threading
import time

def _spinner(stop_event: threading.Event, label: str) -> None:
    frames = ["|", "/", "-", "\\"]
    i = 0
    while not stop_event.is_set():
        click.echo(f"\r{label} {frames[i % 4]}", nl=False)
        i += 1
        time.sleep(0.15)

# In the command:
stop = threading.Event()
t = threading.Thread(target=_spinner, args=(stop, "Querying"), daemon=True)
t.start()
try:
    result = do_long_thing()
finally:
    stop.set()
    t.join()
    click.echo(f"\rDone.          ")  # overwrite spinner line
```

Only use Pattern 3 when Patterns 1 and 2 are genuinely not applicable.
A per-item echo is almost always clearer.

---

## Applying to the ingest command in this project

The `DownloadAndIngestRegistersUseCase` loops over files internally.
The fix requires two changes:

1. Add `on_progress: Callable[[str], None] | None = None` to `execute()`.
2. Call `on_progress(file_info.filename)` after each successful ingest
   (after `self._registry.register(...)`) and after each skip.
3. Update `ingest_cmd` in `presentation/cli.py` to use Pattern 1 or 2.
4. Update the test for `ingest_cmd` to pass a no-op lambda for `on_progress`.

Total files from the Orange County source: approximately 268. At 2 seconds
per file, a full ingest takes roughly 9 minutes. Pattern 1 (progressbar with
estimated time remaining) is the right choice here.

---

## Tests

The callback must be covered by tests:

```python
def test_ingest_calls_on_progress_for_each_downloaded_file():
    """on_progress is called once per successfully ingested file."""
    progress_calls = []
    use_case.execute(force=False, on_progress=lambda f: progress_calls.append(f))
    assert len(progress_calls) == expected_count
```

The CLI test should pass a no-op to avoid output in test runs:

```python
# In the mock setup — on_progress is optional, default None, so no change needed
# unless the test explicitly verifies progress callback behaviour.
```

---

## See also

- Rule: `progress-indicators.mdc`
- Click progressbar docs: https://click.palletsprojects.com/en/8.x/api/#click.progressbar
