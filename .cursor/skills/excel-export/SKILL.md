---
name: excel-export
description: Patterns for adding an XLSX file export to a Flask route, including in-memory workbook generation, currency number formatting, M/D/YYYY date formatting, filter-derived filename slugs, frozen header row, bold/shaded header, Garamond font, and cell borders. Use when adding any "Export to Excel" feature to a web route.
---

# Excel Export

This skill covers generating a downloadable XLSX file from a filtered
dataset in a Flask route. It uses `openpyxl` (standard project dependency)
and produces a file that opens cleanly in Excel with proper formatting —
no string-formatted dollars, no ISO dates.

---

## Architecture placement

The XLSX builder belongs in the **presentation layer** (`presentation/web/routes.py`
or a sibling helper module). It is a formatting concern, not a domain or
application concern.

- The route calls the existing query use case to fetch DTOs.
- The route converts DTOs to rows and builds the workbook.
- No new ports, use cases, or repository methods are required unless the
  export needs a different query than the existing paginated one.

If the export query is substantially different (e.g. a different sort order,
additional columns, or a summary aggregation), introduce a dedicated use case
rather than bending the existing one.

---

## Row limit

Cap exports at a fixed row limit. 50,000 rows is a safe default — it fits
in memory comfortably and stays below Excel's practical usability ceiling.
Pass `page=1, page_size=EXPORT_LIMIT` to the existing query use case.

```python
EXPORT_LIMIT = 50_000
```

Never let the export be unbounded. An unbounded export on a large dataset
will exhaust memory on the server.

---

## Route pattern

```python
@web_bp.route("/things/export")
def export_things() -> Response:
    """Export the current filtered things as an XLSX file (up to 50,000 rows)."""
    factories: dict[str, Any] = current_app.config["USE_CASE_FACTORIES"]
    engine = current_app.config["ENGINE"]
    filter_args = {k: v for k, v in request.args.items() if k != "page"}
    filters = _parse_filters(filter_args)
    use_case = factories["query"](engine)
    result = use_case.execute(filters, page=1, page_size=EXPORT_LIMIT)
    xlsx_bytes = _build_export_xlsx(result.items)
    slug = _filter_slug(filter_args)
    today = date.today().isoformat()
    filename = (
        f"export-{today}-{slug}.xlsx" if slug else f"export-{today}.xlsx"
    )
    response = make_response(xlsx_bytes)
    response.headers["Content-Type"] = (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response
```

Key points:
- Strip `page` from the filter args before passing to the slug builder and
  the use case. The export always starts at page 1.
- The `filter_args` dict (not `request.args`) is passed to `_parse_filters`
  so the route and the export share the same filter parsing logic.

---

## Workbook builder

All cell-level formatting is handled in a single `_apply_worksheet_formatting`
pass after all rows are appended. This keeps `_build_export_xlsx` simple and
avoids multiple loops over the data.

```python
from openpyxl.styles import Border, Font, PatternFill, Side
from openpyxl.worksheet.worksheet import Worksheet

_EXPORT_HEADERS = [
    "Column One", "Column Two", "Amount", "Date", ...
]
_AMOUNT_COL = 3   # 1-based index of the amount column in _EXPORT_HEADERS
_CURRENCY_FORMAT = "$#,##0.00"

_HEADER_FONT = Font(name="Garamond", size=10, bold=True, color="000000")
_BODY_FONT   = Font(name="Garamond", size=10)
_HEADER_FILL = PatternFill(fill_type="solid", fgColor="808080")
_THIN_SIDE   = Side(style="thin")
_THIN_BORDER = Border(
    left=_THIN_SIDE, right=_THIN_SIDE, top=_THIN_SIDE, bottom=_THIN_SIDE
)


def _apply_worksheet_formatting(ws: Worksheet, num_cols: int, num_rows: int) -> None:
    """Apply font, fill, border, number format, and freeze panes to the data range."""
    ws.freeze_panes = "A2"
    for row in ws.iter_rows(min_row=1, max_row=num_rows, max_col=num_cols):
        for cell in row:
            cell.font = _HEADER_FONT if cell.row == 1 else _BODY_FONT
            cell.border = _THIN_BORDER
            if cell.row == 1:
                cell.fill = _HEADER_FILL
            elif cell.column == _AMOUNT_COL:
                cell.number_format = _CURRENCY_FORMAT


def _build_export_xlsx(items: list[MyDTO]) -> bytes:
    """Build an in-memory XLSX workbook from a list of DTOs."""
    wb = openpyxl.Workbook()
    ws = wb.active
    if ws is None:
        return b""
    ws.title = "Sheet Name"
    ws.append(_EXPORT_HEADERS)
    for item in items:
        ws.append(_dto_to_row(item))
    _apply_worksheet_formatting(ws, len(_EXPORT_HEADERS), len(items) + 1)
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf.read()
```

The `if ws is None: return b""` guard satisfies mypy — a freshly created
`Workbook()` always has an active sheet, but the type annotation is
`Optional[Worksheet]`.

Define `_HEADER_FONT`, `_BODY_FONT`, `_HEADER_FILL`, `_THIN_SIDE`, and
`_THIN_BORDER` as module-level constants. openpyxl creates a new style object
each time a constructor is called; defining them once avoids allocating a
separate `Font` or `Border` instance for every cell in the loop.

---

## Data cleanup — apply these to every export

### Currency columns

Write the value as a Python `float` and apply an Excel number format.
Never write a pre-formatted string like `"$2,145.22"` — that makes the
column text, breaking sorting and SUM formulas.

```python
_CURRENCY_FORMAT = "$#,##0.00"

# In _build_export_xlsx, after ws.append():
ws.cell(row=ws.max_row, column=_AMOUNT_COL).number_format = _CURRENCY_FORMAT
```

This displays as `$2,145.22` for positive values and `-$2,145.22` for
negative values (reimbursements, credits).

In `_dto_to_row`, convert the amount string from the DTO to float:

```python
try:
    amount: object = float(item.amount)
except (ValueError, TypeError):
    amount = item.amount   # fall back to raw string if conversion fails
```

### Dates — write a native `date` object, apply `M/D/YYYY` number format

Write a Python `date` (or `datetime`) object, not a pre-formatted string.
openpyxl stores it as an Excel date serial number, so Excel recognises it
as a real date — sortable, filterable, usable in `DATEDIF` and date maths.
Apply the display format via `cell.number_format` in `_apply_worksheet_formatting`.

In `_dto_to_row`:

```python
check_date: object = date.fromisoformat(item.check_date)
```

In `_apply_worksheet_formatting` (add alongside the amount column branch):

```python
_DATE_COL    = 2         # 1-based column index of the date column
_DATE_FORMAT = "M/D/YYYY"

elif cell.column == _DATE_COL:
    cell.number_format = _DATE_FORMAT
```

`M/D/YYYY` displays without leading zeros (`11/15/2021`, not `11/15/2021`).

**Never write a date as a string.** Writing `"11/15/2021"` as a string
makes Excel treat the cell as text — the "date recognise" heuristic is
locale-dependent and unreliable. Writing a native `date` object is the
only guaranteed approach.

### Full _dto_to_row example

```python
def _dto_to_row(item: MyDTO) -> list[object]:
    """Convert a DTO to an ordered list of XLSX cell values."""
    try:
        amount: object = float(item.amount)
    except (ValueError, TypeError):
        amount = item.amount
    d = date.fromisoformat(item.record_date)
    record_date: object = f"{d.month}/{d.day}/{d.year}"
    return [
        item.id,
        record_date,
        amount,
        item.description,
        item.category,
    ]
```

---

## Worksheet formatting — apply these to every export

All five touches are applied inside `_apply_worksheet_formatting` in a single
pass over the data range. Do not apply formatting piecemeal inside the data
append loop — that mixes concerns and makes the formatting harder to audit.

### Freeze the header row

```python
ws.freeze_panes = "A2"
```

Set this once on the worksheet before saving. `"A2"` means "freeze everything
above row 2", which locks the header row when the user scrolls down.

### Bold header, Garamond 10 throughout

```python
_HEADER_FONT = Font(name="Garamond", size=10, bold=True, color="000000")
_BODY_FONT   = Font(name="Garamond", size=10)

cell.font = _HEADER_FONT if cell.row == 1 else _BODY_FONT
```

Use a ternary so both cases are handled in one line per cell. Define the
`Font` objects as module-level constants — openpyxl allocates a new object
each time `Font(...)` is called, so defining them once is both cleaner and
faster.

### Medium gray header fill

```python
_HEADER_FILL = PatternFill(fill_type="solid", fgColor="808080")

if cell.row == 1:
    cell.fill = _HEADER_FILL
```

`fill_type="solid"` is required. Omitting it produces no fill even when a
`fgColor` is specified. `"808080"` is medium gray; adjust as needed. The
`color="000000"` on `_HEADER_FONT` ensures black text on the gray background.

### Thin borders on all cells

```python
_THIN_SIDE   = Side(style="thin")
_THIN_BORDER = Border(
    left=_THIN_SIDE, right=_THIN_SIDE, top=_THIN_SIDE, bottom=_THIN_SIDE
)

cell.border = _THIN_BORDER
```

Applied unconditionally to every cell in the range (header and data rows).
This draws a complete grid. The border range is exactly the populated cells —
`min_row=1, max_row=len(items)+1, max_col=len(_EXPORT_HEADERS)` — so no
empty cells outside the data get a border.

### Currency number format

```python
elif cell.column == _AMOUNT_COL:
    cell.number_format = _CURRENCY_FORMAT
```

Handled inside `_apply_worksheet_formatting` for consistency. See
"Data cleanup — currency columns" above for why the value must be a `float`,
not a pre-formatted string.

---

## Filename with filter slug

Including active filter values in the filename helps the user remember
what they exported without opening the file.

```python
import re

def _filter_slug(args: Mapping[str, str]) -> str:
    """Build a filename-safe slug from active filter values, up to 15 chars."""
    values = [v.strip() for v in args.values() if v.strip()]
    if not values:
        return ""
    combined = " ".join(values)
    slug = re.sub(r"[^A-Za-z0-9]+", "-", combined).strip("-").lower()
    return slug[:15].rstrip("-")
```

Rules applied by this helper:
- Empty filter values are ignored (a blank filter input contributes nothing).
- All non-alphanumeric characters are collapsed to a single hyphen.
- The slug is lowercased and truncated to 15 characters.
- Leading and trailing hyphens are stripped after truncation.

With `department=board of county` and `amount_min=1000`, the slug becomes
`board-of-count` (15 chars, stops mid-word, which is correct behaviour).

---

## Template button

Place the export link in the section header bar, right-aligned, so it is
visible without scrolling and visually associated with the current filter
state:

```html
<div class="section-header" style="display:flex; justify-content:space-between; align-items:center;">
    <span>RESULTS — {{ "{:,}".format(result['total']) }}</span>
    <a href="{{ url_for('web.export_things', **args) }}"
       class="btn-ghost"
       style="font-size:11px; letter-spacing:1px;">EXPORT XLSX</a>
</div>
```

The `args` dict passed from the route must already have `page` stripped.
Stripping happens in the route, not the template:

```python
# In the route that renders the table:
filter_args = {k: v for k, v in request.args.items() if k != "page"}
return render_template("things.html", result=result.to_dict(), args=filter_args)
```

This prevents the `url_for` call from receiving `page` twice (once from
`**args` and once from a pagination-specific keyword argument), which
would raise `TypeError: got multiple values for keyword argument 'page'`.

---

## Testing

Use `openpyxl.load_workbook(io.BytesIO(response.data))` to load the workbook
back from the response and assert cell values, number formats, fonts, fills,
borders, and freeze panes directly. Do not mock openpyxl — let it run so the
full round-trip is exercised.

```python
@pytest.mark.unit
class TestExportRoute:
    def test_export_returns_xlsx_content_type(self):
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[], total=0, page=1, page_size=50000
        )
        client = _make_app(query_uc=query_uc).test_client()
        response = client.get("/things/export")
        assert "spreadsheetml" in response.content_type

    def test_export_calls_use_case_with_50000_limit(self):
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[], total=0, page=1, page_size=50000
        )
        client = _make_app(query_uc=query_uc).test_client()
        client.get("/things/export?category=IT")
        assert query_uc.execute.call_args[1]["page_size"] == 50000
        assert query_uc.execute.call_args[1]["page"] == 1

    def test_export_amount_cell_has_currency_format(self):
        import io
        import openpyxl
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[_make_dto()], total=1, page=1, page_size=50000
        )
        client = _make_app(query_uc=query_uc).test_client()
        response = client.get("/things/export")
        wb = openpyxl.load_workbook(io.BytesIO(response.data))
        ws = wb.active
        assert ws is not None
        assert ws.cell(row=2, column=_AMOUNT_COL).value == 500.0
        assert "$" in ws.cell(row=2, column=_AMOUNT_COL).number_format

    def test_export_date_is_native_date_with_m_d_yyyy_format(self):
        import io
        from datetime import date as date_type
        import openpyxl
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[_make_dto()], total=1, page=1, page_size=50000
        )
        client = _make_app(query_uc=query_uc).test_client()
        response = client.get("/things/export")
        wb = openpyxl.load_workbook(io.BytesIO(response.data))
        ws = wb.active
        assert ws is not None
        # Value must be a native date/datetime — not a string — so Excel
        # treats the cell as a real date rather than text.
        cell = ws.cell(row=2, column=_DATE_COL)
        assert isinstance(cell.value, date_type)
        assert cell.number_format == "M/D/YYYY"

    def test_export_filename_includes_filter_slug(self):
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[], total=0, page=1, page_size=50000
        )
        client = _make_app(query_uc=query_uc).test_client()
        response = client.get("/things/export?category=board+of+county")
        disposition = response.headers["Content-Disposition"]
        assert "board-of-coun" in disposition

    def test_export_filename_no_slug_when_no_filters(self):
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[], total=0, page=1, page_size=50000
        )
        client = _make_app(query_uc=query_uc).test_client()
        response = client.get("/things/export")
        disposition = response.headers["Content-Disposition"]
        assert "export-" in disposition
        assert "--" not in disposition   # no double-dash when no filters

    def test_export_header_row_is_bold(self):
        import io
        import openpyxl
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[_make_dto()], total=1, page=1, page_size=50000
        )
        response = _make_app(query_uc=query_uc).test_client().get("/things/export")
        ws = openpyxl.load_workbook(io.BytesIO(response.data)).active
        assert ws is not None
        assert ws.cell(row=1, column=1).font.bold is True
        assert ws.cell(row=2, column=1).font.bold is False

    def test_export_header_row_has_gray_fill(self):
        import io
        import openpyxl
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[_make_dto()], total=1, page=1, page_size=50000
        )
        response = _make_app(query_uc=query_uc).test_client().get("/things/export")
        ws = openpyxl.load_workbook(io.BytesIO(response.data)).active
        assert ws is not None
        assert ws.cell(row=1, column=1).fill.fgColor.rgb.endswith("808080")

    def test_export_cells_use_garamond_font(self):
        import io
        import openpyxl
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[_make_dto()], total=1, page=1, page_size=50000
        )
        response = _make_app(query_uc=query_uc).test_client().get("/things/export")
        ws = openpyxl.load_workbook(io.BytesIO(response.data)).active
        assert ws is not None
        assert ws.cell(row=1, column=1).font.name == "Garamond"
        assert ws.cell(row=2, column=1).font.name == "Garamond"

    def test_export_top_row_is_frozen(self):
        import io
        import openpyxl
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[_make_dto()], total=1, page=1, page_size=50000
        )
        response = _make_app(query_uc=query_uc).test_client().get("/things/export")
        ws = openpyxl.load_workbook(io.BytesIO(response.data)).active
        assert ws is not None
        assert ws.freeze_panes == "A2"

    def test_export_cells_have_border(self):
        import io
        import openpyxl
        query_uc = MagicMock()
        query_uc.execute.return_value = PaginatedResultDTO(
            items=[_make_dto()], total=1, page=1, page_size=50000
        )
        response = _make_app(query_uc=query_uc).test_client().get("/things/export")
        ws = openpyxl.load_workbook(io.BytesIO(response.data)).active
        assert ws is not None
        assert ws.cell(row=1, column=1).border.left.style == "thin"
        assert ws.cell(row=2, column=3).border.bottom.style == "thin"
```

---

## Checklist

- [ ] Export route strips `page` from `request.args` before building filter slug and filters.
- [ ] Use case called with `page=1, page_size=EXPORT_LIMIT` (not the display page size).
- [ ] Amount written as `float`, not a formatted string.
- [ ] Currency format applied via `cell.number_format`, not by formatting the value.
- [ ] Date written as a native Python `date` object (not a string) in `_dto_to_row`.
- [ ] `_DATE_FORMAT = "M/D/YYYY"` applied to the date column in `_apply_worksheet_formatting`.
- [ ] `_DATE_COL` constant defined at module level alongside `_AMOUNT_COL`.
- [ ] `_filter_slug` truncates to 15 chars and strips trailing hyphens after truncation.
- [ ] Template's `args` dict has `page` stripped before being passed in (prevents `url_for` collision).
- [ ] `if ws is None: return b""` guard satisfies mypy on `wb.active`.
- [ ] `EXPORT_LIMIT` constant defined and documented.
- [ ] `_apply_worksheet_formatting` called once after all rows are appended, not inside the append loop.
- [ ] `freeze_panes = "A2"` set inside `_apply_worksheet_formatting`.
- [ ] Header row: `Font(bold=True)`, data rows: `Font(bold=False)` — both use Garamond 10.
- [ ] `PatternFill(fill_type="solid", ...)` — `fill_type` is required; omitting it silently produces no fill.
- [ ] `Border` applied to every cell in the data range, bounded by `max_row=len(items)+1`.
- [ ] Font, fill, and border objects defined as module-level constants (not constructed per cell).
- [ ] Tests load the response bytes back with `openpyxl.load_workbook` and assert `.font.bold`, `.font.name`, `.fill.fgColor.rgb`, `.border.left.style`, and `freeze_panes` directly.
