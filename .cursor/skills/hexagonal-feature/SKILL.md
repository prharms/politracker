---
name: hexagonal-feature
description: >-
  Step-by-step workflow for implementing a new feature end-to-end in
  Politicket's hexagonal architecture (TypeScript/Electron). Use when adding a
  new use case, repository, IPC handler, or any feature that touches more than
  one layer. Prevents the most common failure mode: importing a concrete
  repository inside a use case, which fails tsc --build (arch-check).
---

# Implementing a New Feature End-to-End (TypeScript/Electron)

## The single most common failure mode

A use case imports the concrete repository class:

```typescript
// WRONG - infrastructure import inside application layer
// This fails tsc --build because application/tsconfig.json does not reference infrastructure
import { StaffRepository } from '../../infrastructure/repositories/staff-repository'

export class ListStaffUseCase {
  constructor(private repo: StaffRepository) {} // concrete type - wrong
}
```

The correct form:

```typescript
// CORRECT - application imports only from application/ports
import type { StaffRepositoryPort } from '../ports/staff-repository-port'

export class ListStaffUseCase {
  constructor(private repo: StaffRepositoryPort) {} // interface type - correct
}
```

The concrete class (`StaffRepository`) is imported in **exactly one place**:
inside a factory function in `container.ts`. Nowhere else.

---

## Step 0 - Create a feature branch

```powershell
git checkout -b feature/<short-description>
```

A new hexagonal feature always touches at least 5 files. This meets the
branching threshold. Never commit new logic directly to `main`.

---

## Implementation order - follow this sequence exactly

Build in this order. Each step imports only from steps that came before it.
**Domain comes first. There are no exceptions to this ordering.**

```
Step 1 -> Domain entity      src/main/domain/           MANDATORY - never skip
Step 2 -> Domain errors      src/main/domain/errors.ts  MANDATORY - add at minimum a NotFound error
Step 3 -> DTO                src/shared/dtos/           (skip only if exists and covers this entity)
Step 4 -> Port interface     src/main/application/ports/
Step 5 -> Repository         src/main/infrastructure/repositories/
Step 6 -> Use case           src/main/application/use-cases/
Step 7 -> Container          src/main/container.ts
Step 8 -> IPC handler        src/main/ipc/handlers/
Step 9 -> IPC registration   src/main/ipc/index.ts + src/preload/index.ts
Step 10 -> Renderer hook/API src/renderer/api/ + src/renderer/hooks/
Step 11 -> Write tests
```

### Domain checklist (must complete before Step 4)

Before writing the port interface, verify:

- [ ] `src/main/domain/[entity].ts` exists and declares the entity interface
- [ ] The entity interface contains ONLY the entity's own properties (no joined names, no display fields)
- [ ] All business rules that govern state changes (closedAt stamping, derived defaults, invariants) are expressed as pure functions in the domain file
- [ ] `src/main/domain/errors.ts` contains at least `[Entity]NotFoundError`
- [ ] The domain file is re-exported from `src/main/domain/index.ts`
- [ ] No `throw new Error(...)` exists in any infrastructure file for this entity - only typed domain errors

---

## Step 1 - Domain entity (MANDATORY)

**File:** `src/main/domain/[entity].ts`

Domain entities are pure TypeScript interfaces with business rule functions.
They describe the business concept, not the database shape and not the
presentation shape. No joined fields. No display-only fields.

```typescript
import type { StaffStatus } from '../../shared/constants'

/** Domain entity representing a staff member. */
export interface Staff {
  readonly id: string
  readonly name: string
  readonly initials: string
  readonly status: StaffStatus
  readonly createdAt: string
}

/**
 * Resolve staff initials: use the provided value if given,
 * otherwise derive from the name.
 */
export function resolveStaffInitials(name: string, provided?: string): string {
  if (provided) return provided
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3)
}

/** Validate that a staff name is non-empty. */
export function validateStaffName(name: string): void {
  if (!name.trim()) throw new Error('Staff name must not be empty')
}
```

**Import rules:**
- May import from: `src/shared/`, Node.js stdlib
- Must NOT import from: `application`, `infrastructure`, `ipc`, `renderer`

---

## Step 2 - Domain errors (MANDATORY)

**File:** `src/main/domain/errors.ts`

Every entity needs at minimum a `[Entity]NotFoundError`. Add additional errors
for each invariant that can be violated (delete guards, status rules, etc).

```typescript
/** Domain error: a staff member with the given id does not exist. */
export class StaffNotFoundError extends Error {
  constructor(id: string) {
    super(`Staff member not found: ${id}`)
    this.name = 'StaffNotFoundError'
  }
}
```

Repositories **must** throw these typed errors instead of `throw new Error(...)`:

```typescript
// WRONG
throw new Error(`Staff record not found: ${id}`)

// CORRECT
import { StaffNotFoundError } from '../../domain/errors'
throw new StaffNotFoundError(id)
```

**Import rules:**
- No imports needed for simple error classes (they extend Error)
- May import from: `src/shared/` if needed

---

## Step 3 - DTO

**File:** `src/shared/dtos/[entity]-dto.ts`

DTOs are the objects that cross the application-to-presentation boundary.
They are also what IPC sends over the wire. DTOs may include joined/display
data that domain entities do not carry.

```typescript
/** Presentation-safe view of a staff record. */
export interface StaffDto {
  id: string
  name: string
  initials: string
  status: 'Active' | 'Inactive'
  createdAt: string
}

/** Fields required to create a new staff record. */
export interface NewStaffInput {
  name: string
  initials?: string
  status: 'Active' | 'Inactive'
}
```

---

## Step 4 - Port interface

**File:** `src/main/application/ports/[entity]-repository-port.ts`

```typescript
import type { StaffDto, NewStaffInput, UpdateStaffInput } from '../../../shared/dtos/staff-dto'

/** Repository port for staff persistence. */
export interface StaffRepositoryPort {
  /** Return all staff records ordered by name. */
  listAll(): StaffDto[]

  /** Return a single staff record by id, or null if not found. */
  findById(id: string): StaffDto | null

  /** Persist a new staff record and return it with generated id and timestamps. */
  create(input: NewStaffInput): StaffDto

  /** Update an existing staff record and return the updated version. */
  update(id: string, input: UpdateStaffInput): StaffDto
}
```

**Import rules:**
- May import from: `src/shared/`, `src/main/domain/`
- Must NOT import from: `infrastructure`, `ipc`, `renderer`

---

## Step 5 - Repository (infrastructure)

**File:** `src/main/infrastructure/repositories/[entity]-repository.ts`

The repository imports domain errors and domain functions. It never re-invents
business logic inline.

```typescript
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { staff } from '../db/schema'
import { StaffNotFoundError } from '../../domain/errors'
import { resolveStaffInitials } from '../../domain/staff'
import type { StaffRepositoryPort } from '../../application/ports/staff-repository-port'
import type { StaffDto, NewStaffInput, UpdateStaffInput } from '../../../shared/dtos/staff-dto'

/** Drizzle-backed repository implementing StaffRepositoryPort. */
export class StaffRepository implements StaffRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return all staff records ordered by name. */
  listAll(): StaffDto[] {
    return this.db.select().from(staff).orderBy(staff.name).all() as StaffDto[]
  }

  /** Return a single staff record by id, or null if not found. */
  findById(id: string): StaffDto | null {
    const result = this.db.select().from(staff).where(eq(staff.id, id)).get()
    return (result as StaffDto) ?? null
  }

  /** Persist a new staff record and return it. */
  create(input: NewStaffInput): StaffDto {
    const record: StaffDto = {
      id: randomUUID(),
      name: input.name,
      initials: resolveStaffInitials(input.name, input.initials),
      status: input.status,
      createdAt: new Date().toISOString()
    }
    this.db.insert(staff).values(record).run()
    return record
  }

  /** Update a staff record and return the updated version. */
  update(id: string, input: UpdateStaffInput): StaffDto {
    const current = this.findById(id)
    if (!current) throw new StaffNotFoundError(id)
    const name = input.name ?? current.name
    const initials = resolveStaffInitials(name, input.initials ?? current.initials)
    this.db.update(staff).set({ name, initials }).where(eq(staff.id, id)).run()
    return { ...current, name, initials }
  }
}
```

**Import rules:**
- May import from: `domain`, `application/ports`, `shared`
- Must NOT import from: `ipc`, `renderer`, `container`
- ALWAYS use typed domain errors - never `throw new Error(...)`
- ALWAYS call domain functions for business rules - never re-implement inline

---

## Step 6 - Use case

**File:** `src/main/application/use-cases/[entity]/[action]-[entity]-use-case.ts`

Use cases receive port interfaces, call them, and return DTOs. They do not
contain business logic - that belongs in domain.



```typescript
/** Use case: list all staff members. */

import type { StaffRepositoryPort } from '../../ports/staff-repository-port'
import type { StaffDto } from '../../dtos/staff-dto'

/** Retrieves all staff members for display. */
export class ListStaffUseCase {
  constructor(private readonly repo: StaffRepositoryPort) {}

  /** Return all staff records ordered by name. */
  execute(): StaffDto[] {
    return this.repo.listAll()
  }
}
```

**Anti-pattern checklist before writing this file:**

- [ ] The `repo` parameter is typed as `StaffRepositoryPort` (the interface).
- [ ] There is no import of `StaffRepository` (the concrete class) anywhere.
- [ ] There is no import from `infrastructure/` anywhere.
- [ ] There is no import from `ipc/` anywhere.
- [ ] Every public method has a JSDoc comment and return type annotation.
- [ ] McCabe complexity is 10 or less - count before writing.

**Import rules:**
- May import from: `application/ports`, `application/dtos`, `shared`
- Must NOT import from: `infrastructure`, `ipc`, `renderer`, `container`

---

## Step 7 - Wire the container

**File:** `src/main/container.ts`

`container.ts` is the ONLY file in the project that instantiates concrete
repository classes. Imports of concrete classes happen inside function bodies,
not at the top of the file.

```typescript
// In container.ts
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

/** Build a ListStaffUseCase wired to the production Drizzle repository. */
export function makeListStaffUseCase(db: BetterSQLite3Database): ListStaffUseCase {
  // Local import - keeps concrete class OUT of module-level imports
  const { StaffRepository } = require('./infrastructure/repositories/staff-repository')
  const { ListStaffUseCase } = require('./application/use-cases/staff/list-staff-use-case')
  return new ListStaffUseCase(new StaffRepository(db))
}
```

Or more idiomatically with static imports isolated to container.ts:

```typescript
import { StaffRepository } from './infrastructure/repositories/staff-repository'
import { ListStaffUseCase } from './application/use-cases/staff/list-staff-use-case'

export function makeListStaffUseCase(db: BetterSQLite3Database): ListStaffUseCase {
  return new ListStaffUseCase(new StaffRepository(db))
}
```

Both are acceptable. The critical constraint is that `StaffRepository` is
imported in `container.ts` and nowhere else outside `infrastructure/`.

---

## Step 8 - IPC handler

**File:** `src/main/ipc/handlers/[entity]-handlers.ts`

IPC handlers are the Electron equivalent of Flask routes. They receive a
message from the renderer, call a use case, and send back a DTO.

```typescript
/** IPC handlers for staff-related channels. */

import { ipcMain } from 'electron'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { makeListStaffUseCase, makeCreateStaffUseCase } from '../../container'
import type { NewStaffInput } from '../../application/dtos/staff-dto'

/** Register all staff IPC handlers against the provided database instance. */
export function registerStaffHandlers(db: BetterSQLite3Database): void {
  ipcMain.handle('staff:list', () => {
    return makeListStaffUseCase(db).execute()
  })

  ipcMain.handle('staff:create', (_event, input: NewStaffInput) => {
    return makeCreateStaffUseCase(db).execute(input)
  })
}
```

**Import rules:**
- May import from: `application/ports`, `application/dtos`, `shared`, `container`
- Must NOT import from: `infrastructure/` - never import a repository here
- `container` is imported for its factory functions only

---

## Step 9 - Register handlers + expose via preload

**`src/main/ipc/index.ts`** - call all register functions at startup:

```typescript
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { registerStaffHandlers } from './handlers/staff-handlers'

/** Register all IPC handlers. Called once from src/main/index.ts at startup. */
export function registerAllHandlers(db: BetterSQLite3Database): void {
  registerStaffHandlers(db)
}
```

**`src/preload/index.ts`** - expose typed API to renderer:

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  staff: {
    list: () => ipcRenderer.invoke('staff:list'),
    create: (input: NewStaffInput) => ipcRenderer.invoke('staff:create', input),
  },
})
```

---

## Step 10 - Renderer API wrapper and hook

**`src/renderer/api/staff-api.ts`** - typed wrapper over `window.api`:

```typescript
import type { StaffDto, NewStaffInput } from '../../shared/dtos/staff-dto'

/** Typed wrappers for staff IPC calls. */
export const staffApi = {
  list: (): Promise<StaffDto[]> => window.api.staff.list(),
  create: (input: NewStaffInput): Promise<StaffDto> => window.api.staff.create(input),
}
```

**`src/renderer/hooks/use-staff.ts`** - React hook for components:

```typescript
import { useState, useEffect } from 'react'
import { staffApi } from '../api/staff-api'
import type { StaffDto } from '../../shared/dtos/staff-dto'

/** Fetch and manage staff list state. */
export function useStaff(): { staff: StaffDto[]; loading: boolean } {
  const [staff, setStaff] = useState<StaffDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    staffApi.list().then((data) => {
      setStaff(data)
      setLoading(false)
    })
  }, [])

  return { staff, loading }
}
```

---

## Step 11 - Write tests

Two test files are required. Both must exist before the task is done.
Coverage below 80% for `src/main/` fails `./make.ps1 test`.

### Use case test

**File:** `src/main/application/use-cases/[entity]/[action]-[entity]-use-case.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { ListStaffUseCase } from './list-staff-use-case'
import type { StaffRepositoryPort } from '../../ports/staff-repository-port'

const mockRepo: StaffRepositoryPort = {
  listAll: vi.fn().mockReturnValue([]),
  findById: vi.fn().mockReturnValue(null),
  create: vi.fn(),
  update: vi.fn(),
}

describe('ListStaffUseCase', () => {
  it('calls repo.listAll and returns the result', () => {
    const useCase = new ListStaffUseCase(mockRepo)
    const result = useCase.execute()
    expect(mockRepo.listAll).toHaveBeenCalledOnce()
    expect(result).toEqual([])
  })
})
```

### IPC handler test

**File:** `src/main/ipc/handlers/[entity]-handlers.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
// Mock ipcMain before importing the handlers
vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }))
import { ipcMain } from 'electron'
import { registerStaffHandlers } from './staff-handlers'

const mockDb = {} as never

describe('registerStaffHandlers', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('registers staff:list handler', () => {
    registerStaffHandlers(mockDb)
    expect(ipcMain.handle).toHaveBeenCalledWith('staff:list', expect.any(Function))
  })
})
```

### Run targeted tests, then full suite

```powershell
cd c:\Projects\prhrt\politicket; npx vitest run src/main/application/use-cases/staff/ -v
./make.ps1 ci
```

---

## Arch-check self-check before running lint

After writing all files, verify each file's imports:

- `application/ports/` - imports only from `application/dtos/` and `shared/`
- `application/use-cases/` - imports only from `application/ports/`, `application/dtos/`, `shared/`
- `infrastructure/repositories/` - imports from `domain/`, `application/ports/`, `application/dtos/`, `shared/`, npm
- `ipc/handlers/` - imports from `application/`, `shared/`, `container.ts`, npm (electron)
- `container.ts` - may import from all layers

Then run:

```powershell
./make.ps1 lint
```

The arch-check step (`tsc --build src/main/tsconfig.json`) will catch any
layer violation as a compile error. Fix before declaring the task done.

---

## See also

- ADR-0001: `docs/adr/0001-hexagonal-architecture-enforcement.md`
- `clean-architecture-imports.mdc` - the layer rules
- `lint-imports-setup` skill - how the enforcement is configured
- `pre-feature-planning` skill - run before starting any feature
