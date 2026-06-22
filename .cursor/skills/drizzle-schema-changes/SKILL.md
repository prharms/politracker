---
name: drizzle-schema-changes
description: Safe workflow for Drizzle ORM schema changes in Politicket - generating migrations, applying them, handling column renames, and resetting migrations in dev. Use when adding tables or columns, renaming columns, running db-upgrade, or when the schema and migration history have diverged.
---

# Drizzle Schema Changes

## Decision tree - what kind of change?

### Adding a table or nullable column
Use drizzle-kit generate normally. No manual review needed - these are pure CREATE/ALTER ADD with no INSERT SELECT.

```powershell
./make.ps1 migration   # generates correct SQL
# review the .sql to confirm it's CREATE TABLE or ALTER TABLE ADD COLUMN
# start the app - auto-migrates on startup
```

### Renaming a column
Do NOT use drizzle-kit generate. It generates broken INSERT SELECT (see below).
Write a one-line migration manually instead:

1. Create `migrations/NNNN_description.sql`:
```sql
ALTER TABLE table_name RENAME COLUMN old_name TO new_name;
```

2. Add the entry to `migrations/meta/_journal.json`:
```json
{ "idx": N, "version": "6", "when": 1234567890000, "tag": "NNNN_description", "breakpoints": true }
```

3. Start the app - auto-migrates on startup.

### Dropping a column or table
drizzle-kit generate handles these correctly. Review the SQL - there should be no INSERT SELECT that references the dropped column.

### Adding a NOT NULL column to a table with existing rows
drizzle-kit generate will create broken SQL (the SELECT will reference the new column name on the source table). Options:
- Add as nullable first, backfill data, then add NOT NULL constraint in a second migration
- Write the INSERT SELECT manually, mapping old columns to new ones explicitly

---

## The drizzle-kit column rename bug

drizzle-kit generates table recreation for column renames. The INSERT SELECT uses
the NEW column name in the SELECT, which does not exist in the source table:

```sql
-- What drizzle-kit generates (WRONG):
INSERT INTO __new_deliverables(..., subproject_id, ...)
SELECT ..., subproject_id, ... FROM deliverables;
-- Fails: no such column: subproject_id

-- What it must be (CORRECT):
SELECT ..., group_id, ... FROM deliverables;
```

This fails with `SqliteError: no such column` at runtime. It does NOT fail silently -
drizzle-kit migrate exits with code 1, but the error message may be swallowed by
make.ps1's output handling.

If a migration fails partway through, the database may be in a partial state
(stranded `__new_*` tables visible in sqlite_master). In dev, the fastest recovery
is deleting the database and using the reset workflow below.

---

## Resetting migrations in dev (no important data)

Use when the schema has changed significantly and the migration history is messy.

```powershell
# 1. Delete the database (Electron must be closed)
Remove-Item "$env:LOCALAPPDATA\Politicket\data\politicket.db"

# 2. Delete migration files
Remove-Item migrations\*.sql
Remove-Item migrations\meta\*.json
```

3. Reset the journal - write `migrations/meta/_journal.json`:
```json
{
  "version": "7",
  "dialect": "sqlite",
  "entries": []
}
```

```powershell
# 4. Generate one clean migration from current schema
./make.ps1 migration
# No prompts - all tables are new, pure CREATE TABLE output

# 5. Verify the generated SQL (no INSERT SELECT, no renames)
# Then start the app - it creates the database and auto-migrates
./make.ps1 dev
```

---

## How auto-migration works

`database.ts` calls `migrate(db, { migrationsFolder })` on every Electron startup.
It reads `migrations/` relative to `app.getAppPath()` (project root in dev) and
applies any migration hashes not yet recorded in `__drizzle_migrations`.

`./make.ps1 db-upgrade` runs `drizzle-kit migrate` against the same AppData database.
Both tools track applied migrations via `__drizzle_migrations` table in the database.

For normal development: just restart the app after generating a migration.
`db-upgrade` is only needed to pre-apply a migration without restarting.

---

## drizzle-kit vs Alembic - what drizzle-kit cannot do

- No downgrade/rollback command - backup is the only rollback
- No Python-style data migrations (arbitrary logic to transform existing rows)
- Column renames generate broken SQL (use ALTER TABLE RENAME COLUMN instead)
- NOT NULL additions to populated tables require manual INSERT SELECT fixes

For schema changes limited to adds, drops, and table renames: drizzle-kit is sufficient.
For column renames or complex data migrations: write the SQL manually.

---

## Checklist before db-upgrade on a live database

- [ ] Read the generated .sql file completely
- [ ] Every INSERT SELECT: SELECT side uses OLD column names from the source table
- [ ] Every new NOT NULL column: table is empty or a valid default is in the SELECT
- [ ] Backup: `Copy-Item "$env:LOCALAPPDATA\Politicket\data\politicket.db" "...\politicket.db.bak"`
- [ ] Run `./make.ps1 db-upgrade`
- [ ] On failure: restore backup, do not attempt to patch the partial state

## See also

- `drizzle-migration-safety.mdc` - zero discretion enforcement rule
- `use-make-targets.mdc` - always use make.ps1, never raw drizzle-kit commands
