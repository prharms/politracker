---
name: pre-feature-planning
description: Pre-flight check before implementing any new feature on an existing project. Reads affected code, identifies all files that will change, checks branching and ADR thresholds, confirms the design with the user in one sentence, then hands off to the appropriate implementation skill. Use before starting any feature, route, use case, or refactor that touches more than one file. Do NOT skip this and jump straight to hexagonal-feature.
---

# Pre-Feature Planning Skill

This skill prevents the two most common failure modes:
1. Building the wrong thing because requirements were not verified against existing code.
2. Discovering a structural conflict mid-implementation that requires starting over.

No implementation code is written during this skill.

---

## Step 1 — Read the spec

Before reading any code, read the project's spec document:

```powershell
# Common locations
# .cursor/specs/0001-irs-data.md
# CLAUDE.md at root (if it exists)
# README.md if it contains architecture guidance
```

Identify:
- Which layer the new feature belongs to.
- Whether a similar feature already exists that can be used as a template.
- Any domain rules that apply to this feature.

If no spec document exists, use `project-inception` to create one first.

---

## Step 2 — Read the affected code

Based on the feature request, read every file that will be touched or that
the new code will depend on. Do not rely on memory from previous sessions.

Mandatory reads for any feature touching the application layer:

| If adding... | Read these files |
|---|---|
| New use case | Existing use case in the same domain; the relevant port(s); the container |
| New CLI command | Existing CLI command file; `main.py` (composition root) |
| New repository method | The repository file; the port it implements; the schema |
| New DTO | Existing DTOs in the same domain |
| New domain entity | Existing entities; domain constants |

Read the actual files. Do not infer their contents.

---

## Step 3 — Identify all files that will change

List every file that will be created or modified. Be exhaustive. Include:
- The new file(s) being created (use case, CLI command, repository, DTO, port, etc.)
- Files that must be updated to register or wire the new code (container,
  `main.py`, CLI command group registration)
- Test files (new test file + any existing test files that need updating)
- Migration files if any ORM model changes

Example output for a new "export contractors" feature:

```
Files to change:
  CREATE  irs_data/application/ports/export_port.py
  CREATE  irs_data/application/use_cases/export/export_contractors_use_case.py
  CREATE  irs_data/infrastructure/export/xlsx_exporter.py
  MODIFY  irs_data/container.py
  MODIFY  irs_data/main.py
  MODIFY  irs_data/presentation/cli/commands/export_commands.py
  CREATE  tests/unit/test_export_contractors_use_case.py
  MODIFY  tests/unit/test_export_commands.py

Total: 8 files (5 new, 3 modified)
```

---

## Step 4 — Check the branching threshold

Count the files from Step 3. Apply the branching rule:

| Condition | Action |
|---|---|
| 3 or more files | Create a feature branch before writing any code |
| New feature being added | Create a feature branch |
| Schema or migration change | Create a feature branch |
| 1-2 non-functional files only | Direct to main is acceptable |

If a branch is needed, state the branch name before proceeding:

```
Branch: feature/export-contractors-xlsx
```

Do not write code before this decision is stated.

---

## Step 5 — Check the ADR threshold

Ask these questions about the feature:

1. Does it introduce a new architectural pattern not seen in this codebase?
2. Does it require a trade-off between reasonable alternatives?
3. Will future developers need to understand why this approach was chosen?
4. Does it establish or change a standard for future similar work?
5. Does it change a boundary or contract between layers?

If the answer to any is yes, run `adr-decision-gate` before proceeding to
implementation. The ADR must be approved before code is written.

---

## Step 6 — State the design in one sentence

Write a single sentence that describes the full change. Make it specific
enough that the user can confirm or reject it without ambiguity.

Examples:

> "Add an `XlsxExporterPort` in application/ports, implement it in
> infrastructure/export, wire it into a new `ExportContractorsUseCase`,
> expose it as an `export contractors` CLI command in `main.py`, and cover it
> with a unit test that mocks the port."

> "Add a `query contractors` CLI command that calls the existing
> `QueryContractorsUseCase` with state and exempt-status filters and prints
> results to stdout, with a unit test using `click.testing.CliRunner`."

Ask the user: "Does this match what you had in mind?"

Wait for explicit confirmation before proceeding to implementation.

---

## Step 7 — Hand off

After confirmation, state which skill handles the implementation:

| Feature type | Primary skill |
|---|---|
| New use case (full stack: port, repo, use case, CLI command, test) | `hexagonal-feature` |
| New CLI command only | `hexagonal-feature` steps 5-7, 8 |
| New repository method or query | `verify-sql-columns` then `hexagonal-feature` steps 3-4, 8 |
| New scraper/data source | `polite-scraping` + `hexagonal-feature` |
| New PostgreSQL table or query | `hexagonal-feature` + `alembic-migration` |
| New XLSX export function | `excel-export` |

State explicitly: "Proceeding with `hexagonal-feature`." Then invoke that skill.

---

## Rules

- This skill produces no code. Its only outputs are the file list, the branch
  name (if needed), any ADR trigger flag, and the one-sentence design summary.
- Never skip to implementation without the user's explicit confirmation in Step 6.
- If reading the existing code in Step 2 reveals a conflict with the proposed
  feature (e.g. the port already exists with a different signature), surface
  the conflict before writing the design summary — do not paper over it.
- If the feature is larger than initially described (more files than expected),
  state the revised scope and re-confirm with the user.

## See also

- `hexagonal-feature` — primary implementation skill for most features.
- `adr-decision-gate` — run when Step 5 flags an architectural decision.
- `project-inception` — if no spec document exists.
- `skill-map` — for choosing between skills when it is not obvious.
