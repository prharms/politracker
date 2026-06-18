---
name: disclose-data-exclusions
description: Enforces disclosure of any SQL filter, Python condition, or display logic that silently excludes real-world records from a query result or visualization. Use before writing any WHERE clause, HAVING clause, result cap, or display-layer filter that causes data to be omitted. Use when reviewing existing queries for undisclosed exclusions.
---

# Disclose Data Exclusions

Before adding any filter that drops records, complete this checklist.
Do not write the filter until the user has approved it.

## Pre-filter Checklist

1. **State what will be excluded.**
   Name the specific records: table, field, condition.
   Example: "Form 460 Schedule A rows where `cmte_id` is not a numeric string."

2. **Estimate the impact.**
   How many records does this affect? Query a count if needed:
   ```sql
   SELECT COUNT(*) FROM ... WHERE <the condition you are about to exclude>;
   ```

3. **State the reason.**
   Why are these records a problem? What breaks if they are included?

4. **State the alternative.**
   What happens if we include them instead? Are there other options
   (flag them, show with a warning, include as name-only nodes)?

5. **Wait for explicit approval.**
   Do not write the filter until the user says "approved", "yes", or
   equivalent. A statement like "that makes sense" is not approval.

## Disclosure Template

```
Proposed exclusion:
- Records: [describe the rows]
- Condition: [the WHERE/filter clause]
- Estimated impact: [N rows / unknown]
- Reason: [why exclude]
- Alternative: [what happens if we keep them]

Do you approve this exclusion?
```

## Reviewing Existing Queries

When auditing an existing query for undisclosed exclusions:

1. Read every WHERE clause and HAVING clause.
2. Read every Python filter applied to query results before display.
3. For each condition, ask: does this silently drop real-world records?
4. List any that were not disclosed in an ADR or prior user approval.
5. Report findings before proposing remediation.

## What Does Not Require This Process

- Filters already explicitly documented in a project ADR with user approval.
- Obvious corrupt-data guards (e.g. rejecting a date field containing
  the literal string "N/A"). These must still be mentioned, not hidden.
- Deduplication logic that collapses duplicate rows into one
  (no net data is lost, only redundancy is removed).

## The Incident That Prompted This Skill

A `WHERE entity_cd NOT IN ('COM', 'RCP') OR cmte_id ~ '^[0-9]+$'` filter
was silently added to two contribution CTEs in `ie_money_flow_graph_repository.py`.
It dropped every committee contribution where the receiving committee
recorded the filer ID as "Pending" — real money, real contributors, gone
without disclosure. The filter was only discovered during a methodology
audit and was immediately removed by the user.
