---
name: project-inception
description: Guides the discovery and incremental-approval phase before writing any code for a new project. Produces a spec document (CLAUDE.md) that becomes the single source of truth. Use when a user has an idea for a new project, asks to plan a new program, or says "I want to build X". Do NOT use for adding a feature to an existing project — use pre-feature-planning instead.
---

# Project Inception Skill

This skill codifies the workflow that produced `CLAUDE.md` on the `ocfl-spending` project.
No code is written during this skill. Its output is a reviewed, approved spec document.

---

## Phase 1 — Discovery (ask before answering)

Run through these question categories. Do not ask all at once. Group into at most
two rounds of questions. Listen carefully — the user's phrasing often contains
implicit answers to later questions.

### Round 1 — What and why

1. **Purpose**: What does the program do in one sentence?
2. **Primary data source**: Where does the data come from?
   (URL to scrape, database, CSV upload, API, user input, etc.)
3. **Primary output / interaction model**: How do users interact with it?
   (CLI only, web dashboard, API, report file, combination)
4. **Scale**: Rough data volume. Hundreds of rows? Millions? Real-time stream?
5. **Domain rules**: Are there business rules specific to this domain that are
   not obvious from the data structure? (fiscal year definitions, negative-amount
   semantics, canonical source rules, classification schemes, etc.)

### Round 2 — How (after Round 1 answers are understood)

6. **Persistence**: Does data need to survive between runs?
   (SQLite, Postgres, flat files, in-memory only)
7. **Presentation detail**: If there is a UI, what style or constraints?
   (Bloomberg terminal, standard Bootstrap, data-dense table, chart-heavy, etc.)
8. **Quality gate**: What is the test coverage target and linting standard?
   (default: 80% coverage, full linter suite)
9. **Distribution**: How is the program installed and run?
   (venv + CLI entry point, Docker, cloud deploy, library, etc.)
10. **Constraints**: Are there legal, ethical, or rate-limiting constraints?
    (government website, polite scraping, PII handling, robots.txt, etc.)

Do not proceed to Phase 2 until all ten categories have an answer, even if
the answer is "no specific requirement".

---

## Phase 2 — Incremental approval

Present the spec in sections, one at a time. For each section:
- State what you are about to write.
- Write it.
- Wait for the user to respond with one of:
  - **"approve"** — proceed to the next section.
  - **Change notes** — revise and re-present. Do not proceed until approved.
  - **"reject"** — discard and re-ask the question that was underspecified.

### Section order

1. Project name, purpose, one-paragraph summary.
2. Architecture decisions (layer map, ORM/persistence choice, framework choice).
3. Domain knowledge (constants, rules, fiscal year definitions, valid ranges, etc.).
4. Data sources and ingestion rules (URLs, filters, date ranges, format constraints).
5. Persistence (table names, schema sketch, migration strategy if any).
6. Presentation layer (CLI commands, Flask routes, UI style constraints).
7. Testing and quality (coverage target, linting tools, markers).
8. Distribution and installation (entry point, `pyproject.toml` essentials).

Each section must be approved before moving to the next.

---

## Phase 3 — Produce CLAUDE.md

After all eight sections are approved, consolidate into a single `CLAUDE.md` at
the project root. Structure:

```markdown
# <Project Name>

## Purpose
One paragraph.

## Architecture
- Layer map (which layers exist, what each owns).
- Framework choices and why.
- Import constraints (e.g. import-linter contracts).

## Domain Knowledge
- Hardcoded constants and where they live.
- Business rules (fiscal year, negative amounts, canonical source, etc.).
- Any classification schemes.

## Data Sources
- Source URLs (as domain constants — URL lives in domain, used in infrastructure).
- File format constraints (XLSX only, date cutoff, etc.).
- Scraping rules (polite scraping, jitter, robots.txt compliance if applicable).

## Persistence
- Database type and why.
- Table names and column sketches.
- Migration strategy.

## Presentation
- CLI commands and what they do.
- Web routes (if any) and what they display.
- UI style constraints.

## Testing and Quality
- Coverage target.
- Linting tools and how to run them.
- Test markers.

## Distribution
- Entry point.
- `pyproject.toml` key sections.
- Environment variables (reference only — no values in CLAUDE.md).

## Skills to Use
List which skills apply to the implementation phase.
```

---

## Phase 4 — Hand off

After CLAUDE.md is approved, identify the implementation skills in order:

| If the project involves... | Use skill |
|---|---|
| Clean architecture layers | `hexagonal-feature` (for each feature) |
| A Flask dashboard | `flask-app-factory` first, then routes via `hexagonal-feature` |
| Web scraping | `polite-scraping` |
| SQLite + SQLAlchemy Core | `sqlite-sqlalchemy-core` |
| Import-linter setup | `lint-imports-setup` |
| Secrets / CI integration | `detect-secrets-ci` |
| Any significant decision | `adr-decision-gate` before coding |

State the recommended skill sequence explicitly. Example:

> Recommended sequence: `lint-imports-setup` (once, at project start),
> then `flask-app-factory`, then `polite-scraping`, then `hexagonal-feature`
> for each use case, with `adr-decision-gate` consulted before any
> non-obvious architectural choice.

---

## Rules

- No code is written during this skill. CLAUDE.md is the only output.
- Every claim in CLAUDE.md is derived from the user's answers — never inferred
  from general knowledge of the domain.
- If a domain rule is assumed (e.g. "fiscal year is October-September"), verify
  it explicitly with the user before writing it into the spec.
- The spec is the source of truth for all subsequent implementation work.
  If implementation reveals a conflict with the spec, update the spec first.

## See also

- `pre-feature-planning` — for adding a feature to an existing project.
- `adr-decision-gate` — for decisions that arise after the spec is approved.
- `skill-map` — for choosing which skills to use during implementation.
