# ADR-0002 - Full CRUD and All Fields Must Be Editable

**Status:** Accepted — Fully Implemented

---

## Context and Problem Statement

Two related gaps were identified in the initial implementation:

### Missing CRUD operations

Some entities were created without a complete set of CRUD use cases. An entity
that can be created but not updated, or listed but not deleted, forces workarounds
(delete-and-recreate, data rot) and is inconsistent with the hexagonal architecture
pattern where every entity port defines the same surface.

### Read-only fields in the UI

The initial UI left many fields read-only after creation. On the Projects page,
type and due date could not be changed once set. On the Subprojects panel, due
date was display-only. On the Tasks page, no field other than status could be
changed at all - title, scope, priority, staff assignment, and due date were all
locked after the task was created.

This creates a maintenance problem: in practice, research scope changes, staff
members are reassigned, and due dates shift. Forcing a delete-and-recreate
workflow to change any field is unusable.

The user stated the rule explicitly: "everything must be editable, always."

---

## Decision

### Every entity must have a complete CRUD surface

Every entity in the application - at every layer - must have the following
operations implemented before the feature is considered done:

- **Create** - use case, repository method, IPC handler, preload bridge, renderer API
- **List** - use case, repository method, IPC handler, preload bridge, renderer API
- **Update** - use case, repository method, IPC handler, preload bridge, renderer API
- **Delete** - use case, repository method (with guard checks), IPC handler, preload bridge, renderer API

An entity that is missing any of these four operations at any layer is an
incomplete implementation and must be finished before the work is merged.

### Every field must be editable in the UI

Every field on every entity in the application must be editable after creation,
with no exceptions. The specific standard is:

- **Text fields** (name, title, notes) - click the cell to open an inline text
  input. Commit on Enter or blur. Cancel on Escape.
- **Select fields** (type, scope, priority, staff, project) - click the cell to
  open an inline select. Commit on change or blur.
- **Status fields** - click the cell to cycle through the valid values in order.
- **Date fields** (due date) - click the cell to open an inline date input.
  Commit on Enter or blur. Cancel on Escape.

No field is ever presented as static display text without a corresponding edit
mechanism.

---

## Options Considered

- **Edit modal / drawer** - a separate form opened by clicking an Edit button.
  Rejected: adds navigation overhead and breaks the dense terminal aesthetic.
  The existing inline pattern is already established for name fields and must
  be extended uniformly, not replaced.

- **Inline edit on every cell (chosen)** - clicking any data cell activates an
  appropriate control for that field type. Consistent with the existing name-
  editing pattern. Matches the keyboard-driven terminal aesthetic.

---

## Implementation Status

### Complete

- `ProjectsPage.tsx` - project name (inline text, click to edit)
- `ProjectsPage.tsx` - project type (click to cycle through PROJECT_TYPES)
- `ProjectsPage.tsx` - project status (click to cycle)
- `ProjectsPage.tsx` - project due date (click for inline date input)
- `SubprojectPanel` (inside `ProjectsPage.tsx`) - subproject name (inline text)
- `SubprojectPanel` - subproject status (click to cycle)
- `SubprojectPanel` - subproject due date (click for inline date input)
- `TaskListPage.tsx` - task title (inline text, click to edit)
- `TaskListPage.tsx` - task scope (click to cycle through TASK_SCOPES)
- `TaskListPage.tsx` - task status (click to cycle through TASK_STATUSES)
- `TaskListPage.tsx` - task priority (click to cycle through TASK_PRIORITIES)
- `TaskListPage.tsx` - task staff assignment (click for inline select)
- `TaskListPage.tsx` - task due date (click for inline date input)
- `StaffPage.tsx` - staff name (inline text)

---

## Consequences

- **Improves:** users can correct any field at any time without deleting and
  recreating records.
- **Improves:** consistent interaction model - every cell behaves the same way
  regardless of which page it appears on.
- **Trade-off:** more complex component render logic per page; managed by
  extracting per-row sub-components to keep cyclomatic complexity under 10.
- **Prohibited:** any new field added to a CRUD page that does not have a
  corresponding click-to-edit mechanism is a violation of this ADR.

---

## Rules for New Work

### When adding a new entity

1. Implement all four CRUD operations (Create, List, Update, Delete) at every
   layer before considering the feature complete: use case, repository,
   port interface, IPC handler, preload bridge, renderer API, React hook, and
   page component.
2. The hexagonal-feature skill checklist enforces this layer by layer.
3. A partial implementation (e.g. create + list but no update or delete) is a
   violation of this ADR and must not be merged.

### When adding a new field to any entity table

1. Choose the edit control type based on the field type (text, cycle, select,
   date).
2. Wire it to the existing `updateX` use case via the `updateSubproject`,
   `updateProject`, `updateTask`, or `updateStaff` hook method.
3. Follow the existing inline-edit pattern: `editingField` state tracks which
   cell is open; an `<input>` or `<select>` replaces the display value when
   active.
4. Do not open a modal. Do not navigate to a detail page.
