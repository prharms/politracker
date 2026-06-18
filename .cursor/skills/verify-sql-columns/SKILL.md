---
name: verify-sql-columns
description: Verifies every column name in a raw SQL query against the ORM model before writing or modifying any SQL. Use whenever adding a new table reference, a new CTE branch, or any new column reference to a raw SQL query. Prevents the class of error where a column name is inferred by analogy with a similar table rather than read from the actual definition.
---

# Verify SQL Columns

This skill exists because inferring column names from similar table names or
from memory is a documented failure mode in this project. The fix is always
the same: read the ORM model before writing any column name.

---

## When to use this skill

Use this skill before writing or modifying any raw SQL query that:

- References a table you have not explicitly read the ORM model for in this session.
- Adds a new CTE branch to an existing query that touches a different table.
- Copies a column reference pattern from a query against a different table.
- Uses a table whose columns you believe you "remember" from a prior session.

If in doubt, run this skill. It takes 60 seconds and has prevented production errors.

---

## Steps

### Step 1 — List every table referenced in the query or new branch

Write out every `FROM <schema>.<table>` and `JOIN <schema>.<table>` in the SQL
you are about to write or modify.

Example:
```
Tables used:
  calaccess.form400series_coverpage  (alias: cvr)
  calaccess.form400series_form497    (alias: f497)
```

### Step 2 — For each table, locate its column definitions

Two sources are available — use whichever is faster:

**Option A — ORM model (preferred for tables already modelled)**

Search `calaccess_orm_models.py` for the `__tablename__` that matches:

```
Grep calaccess_orm_models.py for: __tablename__ = "form400series_form497"
```

Read the full set of `mapped_column` definitions below that class declaration.

**Option B — Live schema export script (use when ORM model is absent or uncertain)**

`tools/extract_postgres_schema.py` connects to the live database via `.env`
credentials and prints every table with its exact column names, data types,
and constraints. Run it when you need ground-truth confirmation or when a
table is not yet in the ORM model:

```powershell
cd c:\Projects\prhrt\legiscan-loader; .venv\Scripts\python.exe tools/extract_postgres_schema.py
```

You can pipe or redirect the output to grep for the specific table:

```powershell
.venv\Scripts\python.exe tools/extract_postgres_schema.py | Select-String "form400series_form497" -Context 0,30
```

Option B is the definitive source — it reflects the actual live schema, not
just what the ORM model declares. Use it whenever there is any doubt.

### Step 3 — Build a verified column list

For each column you intend to reference in the SQL, write it out and
cite the line in the ORM model where it appears:

```
Columns verified for form400series_form497:
  enty_naml    — contributor last name / org name  (line 383)
  enty_namf    — contributor first name             (line 384)
  entity_cd    — entity type code                   (line 382)
  cmte_id      — committee ID                       (line 397)
  ctrib_date   — contribution date                  (line 394)
  amount       — contribution amount                (line 396)
  filing_id    — filing ID                          (line 376)
  amend_id     — amendment ID                       (line 377)
  form_type    — F497P1 / F497P2                    (line 380)
```

### Step 4 — Cross-check every column in the new SQL

Before submitting the query, read through the SQL you have written and verify
every column alias against the verified list from Step 3. Any column not on
the verified list must be looked up before proceeding.

### Step 5 — Note any columns that do NOT exist

If you discover a column that does not exist on the table (e.g. `ctrib_naml`
on `form400series_form497`), stop. Do not guess an alternative. Find the
correct column in the ORM model and document the correction.

---

## Example — the failure this skill prevents

The `form400series_receipts` table has `ctrib_naml` (contributor last name).
The `form400series_form497` table uses `enty_naml` for the same concept.
Writing a new P1 branch by analogy with the receipts table — without reading
the ORM model — produces a runtime `UndefinedColumn` error that only surfaces
when the SQL is executed against the live database, not during tests.

This skill makes that error impossible by requiring the ORM model to be read
before any column name is written.

---

## Checklist

```
[ ] Every table in the query listed
[ ] ORM model class found and read for each table
[ ] Verified column list written out with line citations
[ ] Every column in the new SQL cross-checked against the verified list
[ ] No column name inferred by analogy — all sourced from the ORM model
```

---

## See also

- `sql-and-orm.mdc` — rule requiring this verification step
- `anti-hallucination.mdc` — general read-before-claim requirement
- `calaccess_orm_models.py` — the authoritative source for all table schemas
