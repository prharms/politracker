# Politicket

## Purpose

Politicket is a local, single-user desktop application for tracking opposition
research production. The principal uses it to track clients, projects, research
targets (subjects), staff assignments, tasks, and deliverables across active
engagements. It is a production tracking tool for a team of 5-10 researchers
working across multiple project types. It runs as an Electron desktop
application - no browser chrome, no tabs, no address bar. No login or
authentication is required.

---

## Architecture

**Stack:** TypeScript throughout. Electron + React + Drizzle ORM + SQLite.

**Build tool:** electron-vite (handles the main/renderer/preload split natively).

**Layer map** (hexagonal architecture mapped to Electron):

```
src/
  main/           <- Electron main process (Node.js runtime)
    domain/       <- Entities, value objects, domain rules
    application/  <- Use cases, port interfaces, DTOs, exceptions
    infrastructure/ <- Drizzle repositories implementing ports
    ipc/          <- IPC handlers (the "presentation" layer for main)
    container.ts  <- Composition root, wires infrastructure to ports
  renderer/       <- Electron renderer process (Chromium/React)
    components/   <- Reusable React components
    pages/        <- Route-level page components
    hooks/        <- Custom React hooks
    api/          <- Typed IPC client wrappers (calls window.api.*)
  preload/        <- Context bridge only - exposes typed API to renderer
  shared/         <- TypeScript types and utilities used by both processes
    dtos/         <- DTO interfaces (accessible from both main and renderer)
    ipc-types.ts  <- Typed IPC channel contracts
    constants.ts  <- Domain constants (categories, statuses, project types)
```

**Communication between processes:** Electron IPC only. The renderer never
imports from `src/main/` directly. All data crosses the process boundary via
`window.api.*` (exposed by the preload context bridge) with types defined in
`src/shared/ipc-types.ts`.

**Persistence:** SQLite via better-sqlite3 (synchronous, correct for Electron
main process) + Drizzle ORM (TypeScript-first query builder and schema
manager). Database file path read from environment variable
`POLITICKET_DB_PATH` (default: `politicket.db` in the user data directory).

**Import enforcement:** Two-mechanism enforcement per ADR-0001.

- TypeScript project references (`tsc --build src/main/tsconfig.json`) enforce
  layer contracts at compile time. Violations are build errors - not warnings,
  not suppressible. Transitive violations are blocked structurally: a layer
  cannot see modules its referenced layers cannot see.
- `eslint-plugin-boundaries` in `eslint.config.mjs` enforces the same rules
  at lint time for fast IDE feedback.

Each layer directory under `src/main/` has its own `tsconfig.json` with
`composite: true` and a `references` array limited to allowed layers:

```
domain/tsconfig.json        references: []
application/tsconfig.json   references: [domain]
infrastructure/tsconfig.json references: [domain, application]
ipc/tsconfig.json           references: [application]
tsconfig.json (root)        references: [domain, application, infrastructure, ipc]
```

`container.ts` is the composition root and the only file permitted to import
from all layers. Run architecture check: `./make.ps1 arch-check`.

---

## Domain Knowledge

### Project types

- Candidate Campaign - has Contests (electoral races) as an intermediate
  grouping between Project and Subject
- Ballot Measure - Subjects attach directly to the Project (no intermediate)
- Legislative Advocacy - has Issues/Bills as an intermediate grouping between
  Project and Subject
- Background Research - Subjects attach directly to the Project; structure
  is defined per engagement

### Task types

- Research - standard research assignment against a subject. Statuses:
  Backlog, In Progress, Review, Closed.
- Document - a writing assignment that produces part of a deliverable.
  Statuses: Draft, In Review, Final. Document tasks carry a `deliverable_id`
  and a `sort_order` within that deliverable.

A Document task IS a task. All documents are tasks; not all tasks are
documents. Research tasks can optionally link to the Document task they
feed into via `parent_document_id`.

### Deliverable structure

Deliverables are the final output of a project engagement. They nest:
a Report may be composed of sub-Memos, each of which is itself a
deliverable. A deliverable can be scoped to the project as a whole,
to a project group (contest/bill), or to a specific subject.

Deliverable types: Report, Memo, Other.
Deliverable statuses: Draft, In Review, Final.

### Research categories (shared by tasks)

Finance, Voting Record, Personal History, Legal, Public Statements,
Associations, Other.

Defined as constants in `src/shared/constants.ts`.

### Task priority values

Low, Normal, High, Urgent.

---

## Data Sources

All data is entered manually through the UI. There is no automated ingestion,
scraping, or file import in the current scope.

---

## Persistence

**Database:** SQLite, single file. Path from `POLITICKET_DB_PATH` env var.

**ORM:** Drizzle ORM. Schema defined in
`src/main/infrastructure/db/schema.ts`. Migrations generated by drizzle-kit.

### Table definitions

**`clients`**

- `id` text (UUID), primary key
- `name` text, not null
- `created_at` text (ISO 8601), not null

**`projects`**

- `id` text (UUID), primary key
- `client_id` text, FK -> clients.id
- `name` text, not null
- `type` text, not null - one of: Candidate Campaign, Ballot Measure,
  Legislative Advocacy, Background Research
- `status` text, not null - one of: Active, Complete, Archived
- `notes` text, nullable
- `created_at` text, not null
- `updated_at` text, not null

**`project_groups`** (contests for campaigns; bills/issues for legislative advocacy)

- `id` text (UUID), primary key
- `project_id` text, FK -> projects.id
- `name` text, not null (e.g. "CA Governor's Race 2026", "SB 1234 - Housing")
- `created_at` text, not null

**`subjects`** (research targets: candidates, legislators, orgs, individuals)

- `id` text (UUID), primary key
- `project_id` text, FK -> projects.id
- `group_id` text, FK -> project_groups.id, nullable
- `name` text, not null
- `type` text, not null - one of: Individual, Organization, Measure
- `role` text, nullable (e.g. "Democratic Candidate", "PAC Treasurer")
- `status` text, not null - one of: Active, Inactive, Archived
- `notes` text, nullable
- `created_at` text, not null
- `updated_at` text, not null

**`staff`**

- `id` text (UUID), primary key
- `name` text, not null
- `status` text, not null - one of: Active, Inactive
- `created_at` text, not null

**`deliverables`**

- `id` text (UUID), primary key
- `project_id` text, FK -> projects.id, not null
- `parent_deliverable_id` text, FK -> deliverables.id, nullable
- `group_id` text, FK -> project_groups.id, nullable
- `subject_id` text, FK -> subjects.id, nullable
- `type` text, not null - one of: Report, Memo, Other
- `title` text, not null
- `status` text, not null - one of: Draft, In Review, Final
- `due_date` text, nullable (ISO date)
- `notes` text, nullable
- `created_at` text, not null
- `updated_at` text, not null

**`tasks`**

- `id` text (UUID), primary key
- `subject_id` text, FK -> subjects.id, not null
- `staff_id` text, FK -> staff.id, nullable
- `task_type` text, not null - one of: Research, Document
- `deliverable_id` text, FK -> deliverables.id, nullable (Document tasks only)
- `parent_document_id` text, FK -> tasks.id, nullable (Research tasks only -
  the Document task this research feeds into)
- `sort_order` integer, nullable (Document tasks only - ordering within
  the deliverable)
- `title` text, not null
- `category` text, not null - one of: Finance, Voting Record, Personal
  History, Legal, Public Statements, Associations, Other
- `status` text, not null - Research: Backlog/In Progress/Review/Closed;
  Document: Draft/In Review/Final
- `priority` text, not null - one of: Low, Normal, High, Urgent
- `due_date` text, nullable (ISO date)
- `notes` text, nullable
- `closed_at` text, nullable (ISO 8601, auto-set when status -> Closed/Final)
- `created_at` text, not null
- `updated_at` text, not null

**Migrations:** `drizzle-kit generate` produces SQL migration files in
`migrations/`. Applied via `drizzle-kit migrate`. Never manually edited.

---

## Presentation

**Visual style:** Professional dark terminal aesthetic. Two-color system: white
for content, green for labels and accents. No gray anywhere.

Colors:

- Background: `#000000` (pure black)
- Primary text: `#e8e8e8` (near-white for all content)
- Accent: `#00aa55` (dark green for headers, labels, nav brackets, active states)
- Urgent/error: `#ff3333` (red for urgent priority and stale age indicators)
- Border: `#1e1e1e` (subtle row dividers), `#333333` (section dividers)

No glow effects, no shadows, no gradients.

Font: `Courier New`, monospace, 26px. No other fonts anywhere in the application.

Layout: dense, compact, character-based grid using `ch` units for columns.
Every pixel carries information.

CSS: custom CSS modules per component, no UI framework.
Global styles in `src/renderer/styles/terminal.css`.

**IPC channel groups (planned):**

- `clients:*` - list, create, update
- `projects:*` - list, get, create, update
- `projectGroups:*` - list by project, create, update
- `subjects:*` - list, get, create, update
- `staff:*` - list, create, update
- `deliverables:*` - list by project, get, create, update
- `tasks:*` - list by subject/deliverable/staff, create, update, updateStatus

**Page structure (planned):**

- Dashboard - production summary: tasks by staff, deliverable status across
  active projects
- Projects list - filterable by type and status
- Project detail - groups, subjects, deliverables, open tasks
- Subject detail - task list (Research and Document tasks separately)
- Staff view - workload per staff member, tasks assigned
- Deliverable detail - Document tasks in order, linked research tasks

---

## Testing and Quality

**Coverage target:** 80% for `src/main/` (business logic). 70% for
`src/renderer/` (UI components harder to cover meaningfully).
Enforced by `@vitest/coverage-v8` via `./make.ps1 test`.

**Linter suite:** `./make.ps1 lint` runs in order:

1. `tsc -p tsconfig.node.json --noEmit` - type-check main process + config files
2. `tsc -p tsconfig.web.json --noEmit` - type-check renderer
3. `npm run arch-check` (`tsc --build src/main/tsconfig.json`) - hexagonal layer contracts
4. `eslint .` - style, complexity, JSDoc, `eslint-plugin-boundaries` layer rules
5. `prettier --check .` - formatting

**Test tools:**

- Vitest - unit and integration tests
- React Testing Library - component tests (renderer)
- Playwright - end-to-end tests (launches the Electron window)

**Test file conventions:**

- Unit and integration: `src/**/*.test.ts`
- Component tests: `src/renderer/**/*.test.tsx`
- E2E: `tests/e2e/**/*.spec.ts`

**Integration test database:** in-memory SQLite (`':memory:'`) via
better-sqlite3. Schema applied via Drizzle's `migrate` in the test fixture.

**make.ps1 targets:**

- `./make.ps1 test` - vitest run --coverage (enforces thresholds)
- `./make.ps1 test-fast` - vitest run (no coverage, faster iteration)
- `./make.ps1 test-e2e` - playwright test
- `./make.ps1 test-all` - test + test-e2e in sequence
- `./make.ps1 lint` - full suite: tsc + arch-check + eslint + prettier
- `./make.ps1 arch-check` - tsc --build: hexagonal layer contract enforcement
- `./make.ps1 type-check` - tsc --noEmit only (no arch-check)
- `./make.ps1 format` - prettier --write + eslint --fix
- `./make.ps1 dev` - electron-vite dev (hot reload)
- `./make.ps1 build` - electron-vite build + electron-builder
- `./make.ps1 migration` - drizzle-kit generate
- `./make.ps1 db-upgrade` - drizzle-kit migrate

---

## Distribution

**Application:** Packaged via electron-builder into a Windows `.exe`
installer. SQLite database file stored in the Electron user data directory.

**Development startup:**

```powershell
npm install
./make.ps1 dev
```

**Environment variables** (see `.env.example`):

- `POLITICKET_DB_PATH` - path to SQLite database file
- `NODE_ENV` - `development` or `production`

---

## Skills to Use During Implementation

**Applicable skills:**

- `adr-decision-gate` - use before any non-obvious architectural choice
- `adr-workflow` - for writing ADRs when required
- `affirm-core-policies` - use at start of any architectural session
- `suggest-new-skill` - use when a new TypeScript pattern should be codified
- `git-commit` - commit workflow
- `pre-feature-planning` - before adding any new feature
- `detect-secrets-ci` - add detect-secrets baseline after first real code

**TypeScript-adapted skills (use these):**

- `hexagonal-feature` - rewritten for TypeScript/Electron/Drizzle
- `lint-imports-setup` - rewritten for TypeScript project references + eslint-plugin-boundaries

**Python-specific skills that are inapplicable:**

- `flask-app-factory`, `sqlite-sqlalchemy-core`, `alembic-migration`,
  `polite-scraping`, `db-query-script`, `clean-error-messages`, `html-routes`

---

## Design Decisions (resolved)

**Task status UI:** Sortable table with custom square radio buttons for
inline status changes. No drag-and-drop. The radio buttons are styled to
look like retro terminal toggles - square, monospace-adjacent, no browser
default styling. Status changes are made directly in the table row without
opening a full edit form.

---

## Open Questions (resolve before or during implementation)

1. Should tasks support file attachments (PDFs, screenshots)?
2. Is the research category list complete for your practice?
3. Should deliverables be exportable (PDF, Word)?
