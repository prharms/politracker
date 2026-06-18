---
name: skill-map
description: Master routing guide for all available skills. Use when starting any non-trivial task and unsure which skill to invoke, when planning a sequence of work, or when onboarding to a new project. Returns the correct skill (or sequence of skills) for any given scenario.
---

# Skill Map

This skill is a routing layer. It tells you which skill to use and in what
order for any given scenario. Read this skill first when you are unsure where
to start, then immediately read the skill it points you to.

---

## Starting a new project

| Scenario | First skill | Then |
|---|---|---|
| User has an idea and wants to build something | `project-inception` | skills identified in Phase 4 of that skill |
| User has a spec already (CLAUDE.md exists) | `pre-feature-planning` | `hexagonal-feature` |
| User wants to set up import layer enforcement | `lint-imports-setup` | — |
| User wants to set up secrets scanning in CI | `detect-secrets-ci` | — |
| No `.venv` exists, packages missing, or import errors | `venv-setup` | — |

---

## Adding a feature to an existing project

Always start with `pre-feature-planning`. It determines branching, ADR need,
and which implementation skill to use. Do not skip it.

| Feature type | Pre-feature? | Implementation skill |
|---|---|---|
| New use case (full stack: port, impl, route, test) | Yes | `hexagonal-feature` |
| New Flask route + Jinja2 template | Yes | `hexagonal-feature` + `web-design-new-page` |
| New CLI command | Yes | `hexagonal-feature` (steps 5 and 8 only) |
| New repository method or query | Yes | `verify-sql-columns` then `hexagonal-feature` (steps 3-4 and 8) |
| New data source / scraper (single index, one format) | Yes | `polite-scraping` + `hexagonal-feature` |
| Bulk public document archive (paginated, multiple formats) | Yes | `mass-document-retrieval` + `polite-scraping` + `hexagonal-feature` |
| New SQLite table or complex query | Yes | `sqlite-sqlalchemy-core` + `hexagonal-feature` |
| Any ORM model change requiring a schema migration | Yes | `alembic-migration` (then `hexagonal-feature`) |
| New Flask app / blueprint setup | Yes | `flask-app-factory` + `hexagonal-feature` |
| Add XLSX export to an existing route | No | `excel-export` |
| Visual/template change only | No | `web-design-new-page` |
| Front-end style audit / remediation | No | `frontend-style-audit` |
| Move a route from admin-only to login-required | No | `promote-route-to-login` |

---

## Making an architectural decision

Use `adr-decision-gate` before writing code whenever the change involves a
non-obvious trade-off. After the gate, use `adr-workflow` to write the ADR.

| Situation | Skill |
|---|---|
| Choosing between two reasonable implementation approaches | `adr-decision-gate` |
| Adding a new pattern not seen in the codebase | `adr-decision-gate` |
| Changing a layer boundary or import rule | `adr-decision-gate` |
| Writing or updating an ADR document | `adr-workflow` |
| Checking if a completed feature needs an ADR | `adr-workflow` (Step 4) |

---

## Git and quality gates

| Task | Skill |
|---|---|
| Committing code | `git-commit` |
| Reviewing core policies before a sensitive change | `affirm-core-policies` |
| Babysitting a PR (CI failures, merge conflicts, reviewer comments) | `babysit` (user-level) |

---

## Editor and tooling

| Task | Skill |
|---|---|
| Changing Cursor/VSCode settings | `update-cursor-settings` (user-level) |
| Creating a new Cursor rule | `create-rule` (user-level) |
| Creating a new Agent skill | `create-skill` (user-level) |

---

## Data and interactivity

| Task | Skill |
|---|---|
| Creating a chart, dashboard, or interactive exploration | `canvas` (user-level) |
| Reconnaissance on a new data source | `data-source-recon` |
| Querying the live database to inspect data or schema | `db-query-script` |
| Verifying column names before writing raw SQL | `verify-sql-columns` |

---

## Secrets and credentials

| Task | Skill |
|---|---|
| About to read, glob, or search for `.env` | `protect-dotenv` — stop and read this first |
| Need to know what env vars the project expects | `protect-dotenv` — read `.env.example` only, exact filename |
| User says "I set X in my .env" and you want to verify | `protect-dotenv` — do not verify, take their word for it |

---

## Full skill inventory

### Project-level skills (`.cursor/skills/`)

| Skill | What it does |
|---|---|
| `project-inception` | Discovery + incremental approval to produce CLAUDE.md |
| `venv-setup` | Creates and verifies a Python venv before any code is written |
| `pre-feature-planning` | Pre-flight check before any feature implementation |
| `skill-map` | This file — routes to the right skill |
| `adr-decision-gate` | Decides when and how to write an ADR before coding |
| `adr-workflow` | Writes, updates, and evaluates ADR documents |
| `hexagonal-feature` | Implements a full feature end-to-end in hexagonal architecture |
| `lint-imports-setup` | Sets up import-linter with strict hexagonal contracts |
| `flask-app-factory` | Creates a Flask app wired for hexagonal architecture |
| `sqlite-sqlalchemy-core` | SQLAlchemy Core patterns for SQLite repositories |
| `polite-scraping` | Well-behaved HTTP scraper with jitter, User-Agent, robots.txt |
| `mass-document-retrieval` | Bulk retrieval of public documents from paginated archives (PDF, DOCX, multiple formats) |
| `excel-export` | XLSX file export from a Flask route with currency formatting, M/D/YYYY dates, and filter slugs |
| `detect-secrets-ci` | Non-interactive detect-secrets integration for CI/lint pipelines |
| `alembic-migration` | Correct workflow for generating, reviewing, and applying Alembic migrations |
| `web-design-new-page` | Creates or audits Jinja2 templates for visual coherence |
| `frontend-style-audit` | Audits existing templates for visual inconsistencies |
| `affirm-core-policies` | Re-reads anti-hallucination and architecture import rules |
| `git-commit` | Enforces correct git commit workflow |
| `data-source-recon` | Reconnaissance on a new data source before integration |
| `db-query-script` | Writes a `tools/` Python script to query the live database via `.env` credentials |
| `verify-sql-columns` | Verifies every column name in a raw SQL query against the ORM model before writing |
| `protect-dotenv` | Absolute prohibition on reading `.env` — covers what to do instead |
| `promote-route-to-login` | Moves a Flask route from `@admin_required` to `@login_required`, including file renames, template moves, nav updates, and homepage card |

### User-level skills (`~/.cursor/skills-cursor/`)

| Skill | What it does |
|---|---|
| `canvas` | Creates interactive dashboards and charts in Cursor Canvas |
| `babysit` | Keeps a PR merge-ready in a loop (CI, conflicts, comments) |
| `create-rule` | Creates Cursor rules for persistent AI guidance |
| `create-skill` | Guides creation of new Agent Skills |
| `update-cursor-settings` | Modifies Cursor/VSCode settings.json |

---

## Common task sequences

### New Python project from scratch
```
project-inception
  → venv-setup                (first — before any code)
  → lint-imports-setup        (once, at project start)
  → detect-secrets-ci         (once, after git init)
  → flask-app-factory         (if web dashboard)
  → polite-scraping           (if data scraping)
  → sqlite-sqlalchemy-core    (if SQLite persistence)
  → hexagonal-feature         (for each use case)
  → git-commit                (per commit)
```

### New feature on an existing project
```
pre-feature-planning
  → adr-decision-gate         (if Step 5 flags a decision)
    → adr-workflow            (to write the ADR)
  → hexagonal-feature         (main implementation)
    → alembic-migration       (if any ORM model changes schema)
  → web-design-new-page       (if a template is involved)
  → git-commit
```

### Visual refresh / style audit
```
frontend-style-audit          (produces prioritised remediation plan)
  → web-design-new-page       (for each template change)
  → git-commit
```

### Uncertain about a design decision mid-feature
```
Stop current implementation
  → adr-decision-gate         (is this ADR-worthy?)
    → adr-workflow            (yes: write ADR, get approval)
  → resume hexagonal-feature
```

---

## How to use this skill

1. Read this file.
2. Find your scenario in the tables above.
3. Read and follow the skill it points to — do not just announce it.
4. If the scenario is not in the tables, ask the user before guessing.
