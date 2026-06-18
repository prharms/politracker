---
name: data-source-recon
description: >-
  Pre-implementation reconnaissance workflow for a website containing downloadable
  data files. Samples 2-3 files, inspects their structure, and produces a design
  decision covering schema, persistence strategy, and parsing notes — before any
  ingest code is written. Use when the user has found a government or institutional
  website with downloadable documents and wants to plan an ingest pipeline, or when
  asked to assess a data source before building anything.
---

# Data Source Reconnaissance

Complete all five phases in order before writing any ingest code. The output of
this skill is a design decision, not a program. The program comes after.

---

## Phase 1 — Index reconnaissance

Fetch the index page and answer these questions. Do not download data files yet.

**Catalogue the source:**
- How many files are linked?
- What file types are present? (XLSX, XLS, CSV, PDF, ZIP — or mixed)
- What is the naming pattern? (e.g. `BCC_YYYY-MM-DD.xlsx`)
- What date range do the files cover?
- Is there more than one index page? (pagination, multiple sections)
- Is a login or cookie required to download?
- Does `robots.txt` allow scraping? (fetch `{scheme}://{host}/robots.txt`)

**Flag blockers before proceeding:**
- Mixed formats (XLSX and XLS) — note which are present; plan to skip unsupported types
- ZIP archives containing multiple files — requires extraction step
- Redirects or JS-rendered links — `requests` will not follow JS; note this
- Login walls — out of scope for automated ingest; flag for user

**Output:** a one-paragraph summary of what is available and any blockers.

---

## Phase 2 — Sample download

Download exactly **3 files** using polite-scraping conventions (see
`polite-scraping` skill). Choose:
- The **earliest** available file
- The **most recent** available file
- One from **the middle** of the date range

Save all three to a `samples/` directory. Do not parse them yet.

```powershell
# If samples/ does not exist
New-Item -ItemType Directory samples
```

If fewer than 3 files exist, download all of them.

Use a jittered delay between downloads even for this sample run — the source is
a live government server.

---

## Phase 3 — Format inspection

Open each sample file and record the following for each one. Note any differences
between files — inconsistency across files is a parsing risk.

**For XLSX / XLS / CSV:**

| Question | What to look for |
|---|---|
| How many rows precede the header? | Count non-data rows at the top (titles, report metadata, blank rows) |
| Which row contains column names? | Note the row number (1-indexed) |
| What are the column names? | List all of them exactly as they appear |
| Are there footer rows? | Totals row, blank row, source note at the bottom |
| What is the date format? | `YYYY-MM-DD`, `MM/DD/YYYY`, Excel serial number, mixed |
| Are numeric fields clean? | Currency symbols, commas, parentheses for negatives |
| Are there negative values? | Note what they represent (refunds, corrections, reimbursements) |
| Are any rows blank? | Mid-file blanks must be skipped during parsing |
| Are merged cells present? | Merged headers require special handling in openpyxl |
| What is the file encoding? | Relevant for CSV; XLSX is always UTF-8 internally |

**For PDF:**

Note whether text is selectable (digital PDF) or scanned (requires OCR). If
scanned, flag as out of scope for automated ingest.

**Structural differences between files to flag:**
- Column count changes between files
- Column names change (renamed headers in newer files)
- New columns appear in later files
- Skip-row count changes between files

---

## Phase 4 — Complexity and integration assessment

Answer each question, then read off the recommendation.

**Data shape:**

| If... | Then... |
|---|---|
| All files contain the same flat columns, one row per record | Single table |
| Files contain a header section + line-item rows | Two tables with FK |
| Files contain multiple distinct entity types | Multiple tables |

**Volume and query pattern:**

| If... | Then... |
|---|---|
| < 5 million rows, standard filtering and aggregation | SQLite |
| > 5 million rows or analytical queries across large date ranges | Consider DuckDB |
| Real-time writes from multiple processes | PostgreSQL |

**Integration:**

| If... | Then... |
|---|---|
| This is a standalone dataset with no existing database | New SQLite file |
| Data must JOIN against an existing database by a shared key | Extend the existing schema |
| Data overlaps with an existing table (same records, updated values) | Upsert strategy, not append |
| Source is canonical (re-downloading the same file gives same data) | Append-only, no dedup |

**Reimbursements / corrections:**

If negative values appear, confirm their meaning with the source documentation
before deciding how to handle them. Do not discard them without explicit
instruction — they affect net spend calculations.

---

## Phase 5 — Plan output

Write a short structured summary covering the following. This becomes the basis
for `CLAUDE.md` or a design document before implementation starts.

```
## Source
- URL:
- File count:
- File types:
- Date range covered:
- robots.txt: [allows / disallows / unavailable]

## Parsing notes
- Skip rows: [N rows before header]
- Header row: [row number]
- Columns: [list]
- Date format: [format string or description]
- Known quirks: [negatives, blanks, merged cells, encoding issues]
- Structural differences between files: [none / list]

## Hard constraints from domain
- Start date filter: [date or none]
- Excluded record types: [e.g. payroll excluded by source]
- Negative values mean: [reimbursements / corrections / discard]

## Recommended schema
Table: <name>
Columns: <col> (<type>), ...
Notes: <anything unusual>

## Persistence strategy
- Database: [SQLite / DuckDB / extend existing]
- Ingest pattern: [append-only / upsert / replace]
- File registry: [yes — track which files have been ingested / no]

## Open questions before implementation
- [List anything that cannot be determined from the sample alone]
```

---

## Decision: proceed or escalate?

Before handing off to implementation, confirm:

- [ ] All three samples parsed without errors
- [ ] Column names are consistent across samples (or differences are documented)
- [ ] Skip-row count confirmed for at least 2 files
- [ ] Negative values understood and handling decided
- [ ] Persistence strategy chosen
- [ ] No blockers from Phase 1 remain unresolved

If any item is unchecked, resolve it or flag it as an open question before
implementation begins. Do not write ingest code against an incompletely understood
source.

---

## See also

- `polite-scraping` — implementation of the scraper used in Phase 2
- `sqlite-sqlalchemy-core` — schema and repository implementation after this skill completes
- `hexagonal-feature` — adding the ingest use case and CLI command
