---
name: adr-workflow
description: Workflow for writing new ADRs, updating existing ADRs, and evaluating whether a code change requires an ADR. Use when asked to write, create, or update an ADR, when starting a significant code change, when completing a feature, or when the user asks whether an ADR is needed.
---

# ADR Workflow

ADRs live in `docs/adr/`. File naming: `NNNN-kebab-case-title.md`, zero-padded to
four digits. The template is `docs/adr/template.md`.

---

## Step 1 — Always run the directory listing first

Before writing, numbering, or updating any ADR, run:

```powershell
Get-ChildItem c:\Projects\prhrt\docs\adr | Sort-Object Name | Select-Object Name
```

This is not optional. The next ADR number must be derived from the actual directory
contents, not from memory or a previous count. Skipping this step produces duplicate
or out-of-sequence numbers.

From the listing, confirm:
- The highest existing number (next ADR = highest + 1)
- That no ADR already covers the same decision (search titles before proceeding)

---

## Step 2 — Decide: new ADR, update existing, or neither

### Write a new ADR when

- A genuinely new architectural or design decision is being made that will affect
  future code (e.g. choosing a new pattern, adopting a standard, defining a boundary).
- A significant technical choice was made during implementation that is not documented
  anywhere and future developers would need to understand why.
- A standard was established that must be enforced going forward (e.g. table style
  rules, explanatory text tiers, import layer rules).

### Update an existing ADR when

- Implementation status has changed (items moved from Remaining to Complete).
- A decision was partially amended but the core choice stands.
- New files or routes are added to the scope of an existing standard.
- A known violation is resolved and the ADR should reflect the current state.

To update: read the ADR, identify the specific section that is stale, and make a
targeted edit. Do not rewrite the entire document. Preserve the decision rationale
even if the implementation status changes.

### Write neither when

- The change is a routine implementation of an already-documented decision.
- The change is a bug fix with no architectural implication.
- The change affects only tests, documentation, or configuration values.
- The decision is already fully covered by an existing ADR — update status instead.

**The test for "new ADR":** Would a developer joining the project six months from now
need to understand this decision to work safely in this area? If yes, document it.
If the answer is already in an existing ADR, update that one.

---

## Step 3 — Scan existing ADRs for relevance before any significant change

Before beginning a significant code change (new feature, refactor, schema change,
layer boundary change, new pattern), read the ADR directory listing and identify
which existing ADRs are relevant to the work.

Categories to check:

| Change type | ADRs likely affected |
|---|---|
| New web route or template | ADR-0046 (explanatory text), ADR-0054 (table/style standard), ADR-0013 (Flask/HTMX), ADR-0037 (CSP) |
| New use case or repository | ADR-0001 (clean architecture), ADR-0003 (protocols), ADR-0011 (repository pattern), ADR-0053 (presentation DB access) |
| Database schema change | ADR-0008 (Alembic), ADR-0029 (session lifecycle) |
| Authentication change | ADR-0036 (user auth) |
| AI feature change | ADR-0009 (position extraction), ADR-0015 (Anthropic Claude) |
| Import layer change | ADR-0001, ADR-0020 (port migration), ADR-0053 |
| CSS or front-end pattern | ADR-0054 (visual consistency), ADR-0046 |
| New organisation/alias logic | ADR-0007 (canonical registry) |

Read the identified ADRs before writing code. If the change violates a documented
decision, either: (a) follow the decision, or (b) write a new ADR superseding it and
get explicit agreement before proceeding.

---

## Step 4 — After completing significant code changes, re-evaluate

After completing a feature or refactor, ask:

1. Did any implementation status block in an existing ADR change?
   → Update the ADR's Implementation Status section.
2. Were any known violations in an existing ADR resolved?
   → Move them from Remaining to Complete.
3. Was a new pattern introduced that is not documented anywhere?
   → Write a new ADR.
4. Did the change affect the scope of an existing standard?
   → Update the ADR to name the new files or routes in scope.

---

## Step 5 — Writing a new ADR

### File name

```
NNNN-kebab-case-title.md
```

- `NNNN` = highest existing number + 1, zero-padded to 4 digits.
- Title: lowercase, hyphens, no articles ("the", "a") unless essential, max 6 words.
- File lives in `docs/adr/`.

### Format rules

ADRs are read by humans. Use bullet points and markdown subheaders to express
information. Do not use pipe tables (`| col | col |`) anywhere in an ADR.

- Use `**bold label** — explanation` for labelled items in a list.
- Use `###` subheaders to break sections into named subsections.
- Use a nested bullet list when comparing options instead of a table.
- The only exception is a schema definition where column names and types
  are the primary content — even then, prefer a definition list or
  named subsections over a pipe table.

### Required sections (follow `docs/adr/template.md`)

Every ADR must have:

- **Status** — `Accepted`, `Accepted — Partially Implemented`, `Accepted — Fully
  Implemented`, `Superseded by ADR-XXXX`, or `Deprecated`.
- **Context and Problem Statement** — what was wrong or ambiguous that required a
  decision. Cite specific files, line numbers, or concrete evidence where possible.
  Do not describe the decision here — only the problem.
- **Decision** — what was decided and the canonical standard going forward. Be
  specific enough that the standard can be applied without reading any other document.
- **Implementation Status** — split into Complete and Remaining. Every item must be
  specific (file name, not "various files"). Remaining items must be actionable.
- **Consequences** — what improves, what the trade-offs are, what is now prohibited.

Optional sections to include when relevant:
- **Options Considered** — only when the decision was non-obvious and alternatives
  were genuinely evaluated.
- **Rules for new work** — when the ADR establishes a standard that must be followed
  by future routes, use cases, or templates.

### Status values and when to use them

- **`Accepted`** — Decision made; implementation may or may not be started.
- **`Accepted — Partially Implemented`** — Some items complete, others remaining.
- **`Accepted — Fully Implemented`** — All acceptance criteria verified.
- **`Superseded by ADR-XXXX`** — A later ADR replaces this one; link to it.
- **`Deprecated`** — The decision is no longer relevant; brief note why.

---

## Step 6 — Updating an existing ADR

1. Read the full ADR before editing.
2. Make targeted edits only. Change the specific section that is stale.
3. Update the **Status** line if implementation completeness has changed.
4. If items moved from Remaining to Complete, move them in the Implementation Status
   section — do not just delete the Remaining list.
5. Do not rewrite the Context, Options, or Rationale sections unless they are
   factually wrong. The historical record of why the decision was made has value.

---

## See also

- ADR template: `docs/adr/template.md`
- Related rules: `linter-must-pass.mdc`, `git-branching.mdc`
- Skills that generate ADR-worthy work: `hexagonal-feature`, `frontend-style-audit`,
  `web-design-new-page`
