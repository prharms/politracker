---
name: periodic-over-event-dedup
description: Enforces deduplication policy when combining periodic filings (for example Form 460) with event-driven filings (for example Form 496 or Form 497). Use when building or reviewing SQL/ORM queries that merge both sources, especially for money-flow, IE, or contribution calculations.
---

# Periodic Over Event Dedup

## Rule

any time we are dealing with both periodic data (eg form 460) and event driven data (eg form 496 or form 497), the proper way to deduplicate is that the periodic data takes absolute preference, and the event driven data is only supplemental

## Basis

For independent expenditures, dedup is a date-cutoff rule, not row-by-row key matching.

The helper builds `ie_460_cutoffs`: for each filer, it finds the max Form 460
Schedule D `expn_date` in the query window/scope.

## Required Implementation Pattern

1. Build the periodic branch first (`rcpt_460`, `ie_460`, etc.).
2. Build a periodic coverage cutoff CTE derived from the periodic branch (for IE:
   `ie_460_cutoffs`).
3. Keep event rows only when they are not already covered by periodic filings
   under the cutoff rule (for IE: event date must be strictly greater than cutoff).
4. Combine with `UNION ALL` after filtering event rows (do not dedup periodic rows away).
5. Document the cutoff/key logic in query docstrings.

## Guardrails

- Never treat event-driven filings as authoritative when periodic coverage exists.
- Never replace a cutoff-coverage rule with row-by-row exact-key matching.
- Keep all SQL in `infrastructure/persistence/`.
- Use bound parameters via `sqlalchemy.text()`.

## Test Expectations

- Periodic-covered event row is excluded.
- Periodic-only row remains.
- Event-only row remains.
- Event row on/before cutoff is excluded; event row after cutoff is kept.
