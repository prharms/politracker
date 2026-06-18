---
name: adr-decision-gate
description: Determines whether a proposed code change requires an Architecture Decision Record (ADR) before implementation begins. Run this skill when a change involves a non-obvious trade-off, a new pattern, or a layer boundary change. Produces either "ADR required — write it first" or "No ADR needed — proceed". Integrates with adr-workflow for the writing step.
---

# ADR Decision Gate

The purpose of this skill is to answer one question before any code is written:

> Does this change require an ADR, and if so, what must it say before I proceed?

An ADR written after the fact is a history document. An ADR written before the
code is a design constraint — it prevents the wrong implementation.

---

## The five gate questions

Ask these questions about the proposed change. If the answer to any is **yes**,
an ADR is required before implementation begins.

### Q1 — New pattern
> Does this change introduce an architectural or design pattern not currently
> used anywhere in this codebase?

Examples that trigger this:
- Introducing a composition root for the first time.
- Adopting SQLAlchemy Core instead of ORM for a new persistence layer.
- Using a different authentication mechanism.
- Introducing a new type of port (e.g. a streaming port).

Examples that do NOT trigger this:
- Adding a new use case that follows an existing use case pattern.
- Adding a new route that follows an existing route pattern.
- Adding a new repository method that follows existing methods.

---

### Q2 — Trade-off between alternatives
> Are there two or more reasonable approaches, and is it not obvious which is correct?

Examples that trigger this:
- SQLite vs Postgres for a new project's persistence.
- ORM vs SQLAlchemy Core for a particular query pattern.
- Session-based auth vs JWT.
- In-process task queue vs external broker.
- Storing files on disk vs in the database.

Examples that do NOT trigger this:
- Standard implementation of a pattern that is already documented.
- Adding a field to an existing DTO.
- Fixing a bug with one obvious correct approach.

---

### Q3 — Future developer comprehension
> Would a developer joining this project six months from now need to understand
> *why* this decision was made to work safely in this area?

This is the most important gate question. A decision that looks arbitrary
without context is almost always ADR-worthy.

Examples that trigger this:
- Why negative amounts are preserved rather than rejected.
- Why the composition root is outside all layers.
- Why `robots.txt` compliance is enforced even for government data.
- Why fiscal year boundaries are defined in domain rather than configuration.

Examples that do NOT trigger this:
- Why a specific variable is named `filters` rather than `params`.
- Why a particular helper function was extracted from a complex function.

---

### Q4 — Standard for future work
> Does this change establish a rule or standard that must be followed for all
> similar work going forward?

Examples that trigger this:
- Defining the import layer contracts (all future features must follow them).
- Establishing the DTO boundary pattern (all future routes must use DTOs).
- Defining the polite scraping rules (all future scrapers must follow them).
- Establishing a visual consistency standard for templates.

Examples that do NOT trigger this:
- Adding a second route that follows the standard already set by the first.
- Adding a test that follows the existing test patterns.

---

### Q5 — Layer boundary or contract change
> Does this change alter a boundary between layers, modify a port interface,
> or change the dependency injection wiring in a way that affects multiple
> existing features?

Examples that trigger this:
- Changing the signature of an existing port.
- Moving a module from one layer to another.
- Changing how the container wires dependencies.
- Changing `pyproject.toml` import-linter contracts.

Examples that do NOT trigger this:
- Adding a new port that does not affect existing ports.
- Adding a new module to an existing layer.

---

## Gate outcome

### If any gate question is YES

State clearly:

```
ADR required before implementation.
Topic: <one sentence describing the decision>
Key question the ADR must answer: <the specific trade-off or rationale>
```

Then invoke `adr-workflow` to write the ADR. The ADR must be:
1. Written in full.
2. Reviewed and approved by the user.
3. Committed to `docs/adr/` before any implementation code is written.

### If all gate questions are NO

State clearly:

```
No ADR required. This is a routine implementation of existing patterns.
Proceeding with implementation.
```

Then proceed to the appropriate implementation skill.

---

## Worked examples from this project

### Example 1 — Composition root (ADR-worthy)

> Change: Move dependency wiring from presentation/container to main.py outside all layers.

- Q1: Yes — composition root is a new pattern in this codebase.
- Q3: Yes — future developers need to understand why container is not importable by presentation.
- Q4: Yes — establishes the rule that only main.py imports container.
- Q5: Yes — changes how presentation receives its dependencies.

**Outcome: ADR required.**

---

### Example 2 — SQLAlchemy Core instead of ORM (ADR-worthy)

> Change: Use SQLAlchemy Table/MetaData/select() rather than declarative ORM models.

- Q1: Yes — Core is a different persistence pattern.
- Q2: Yes — ORM was the reasonable alternative.
- Q3: Yes — future developers will wonder why there are no ORM models.

**Outcome: ADR required.**

---

### Example 3 — Adding a second CLI command (not ADR-worthy)

> Change: Add `status` command to the existing Click CLI group, following the
> same pattern as the existing `ingest` command.

- Q1: No — CLI commands already exist; this follows the same pattern.
- Q2: No — there is one obvious approach.
- Q3: No — the pattern is already documented.
- Q4: No — no new standard is being established.
- Q5: No — no boundary or contract changes.

**Outcome: No ADR required.**

---

### Example 4 — Negative amount semantics (ADR-worthy)

> Change: Preserve negative disbursement amounts instead of filtering them out.

- Q2: Yes — filtering vs. preserving is a genuine trade-off.
- Q3: Yes — a developer will wonder why negative values exist in a disbursements table.

**Outcome: ADR required.** The ADR must record that negative amounts represent
reimbursements and that the source data is canonical.

---

## Relationship to pre-feature-planning

`pre-feature-planning` (Step 5) calls this gate automatically. You do not
need to run this skill separately if you have already run `pre-feature-planning`.
Run this skill directly only when:
- You are mid-implementation and a decision point arises unexpectedly.
- The user asks whether a specific decision needs an ADR.
- You are reviewing a completed feature and checking if documentation is owed.

---

## See also

- `adr-workflow` — for writing the ADR once this gate determines one is needed.
- `pre-feature-planning` — incorporates this gate as Step 5.
- `project-inception` — ADR topics often surface during Phase 2 of inception.
