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

## Implementation order - follow this sequence

Build in this order. Each step imports only from steps that came before it.

```
Step 1 -> Port interface     src/main/application/ports/
Step 2 -> Domain entity      src/main/domain/           (skip if exists)
Step 3 -> Repository         src/main/infrastructure/repositories/
Step 4 -> DTO                src/main/application/dtos/ (skip if exists)
Step 5 -> Use case           src/main/application/use-cases/
Step 6 -> Container          src/main/container.ts
Step 7 -> IPC handler        src/main/ipc/handlers/
Step 8 -> IPC registration   src/main/ipc/index.ts + src/preload/index.ts
Step 9 -> Renderer hook/API  src/renderer/api/ + src/renderer/hooks/
Step 10 -> Write tests
```

---

## Step 1 - Port interface

**File:** `src/main/application/ports/[entity]-repository-port.ts`

```typescript
/** Repository port for [entity] persistence. */

export interface StaffRepositoryPort {
  /** Return all staff records ordered by name. */
  listAll(): StaffDto[]

  /** Return a single staff record by id, or null if not found. */
  findById(id: string): StaffDto | null

  /** Persist a new staff record and return it with generated id and timestamps. */
  create(input: NewStaffInput): StaffDto

  /** Update an existing staff record and return the updated version. */
  update(id: string, input: Partial<NewStaffInput>): StaffDto
}
```

**Import rules:**
- May import from: `src/main/application/dtos/`, `src/shared/`
- Must NOT import from: `infrastructure`, `ipc`, `renderer`

---

## Step 2 - Domain entity (if new)

**File:** `src/main/domain/[entity].ts`

Domain entities are plain TypeScript interfaces or classes with validation.
They describe the business concept, not the database shape.

```typescript
/** Domain entity representing a staff member. */

export interface Staff {
  readonly id: string
  readonly name: string
  readonly status: 'Active' | 'Inactive'
  readonly createdAt: string
}

/** Validates that a staff name is non-empty. */
export function validateStaffName(name: string): void {
  if (!name.trim()) {
    throw new Error('Staff name must not be empty')
  }
}
```

**Import rules:**
- May import from: `src/shared/`, Node.js stdlib
- Must NOT import from: `application`, `infrastructure`, `ipc`, `renderer`

---

## Step 3 - Repository (infrastructure)

**File:** `src/main/infrastructure/repositories/[entity]-repository.ts`

```typescript
/** Infrastructure adapter: Drizzle repository for staff. */

import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { staff } from '../db/schema'
import type { StaffRepositoryPort } from '../../application/ports/staff-repository-port'
import type { StaffDto, NewStaffInput } from '../../application/dtos/staff-dto'

/** Drizzle-backed repository implementing StaffRepositoryPort. */
export class StaffRepository implements StaffRepositoryPort {
  constructor(private db: BetterSQLite3Database) {}

  /** Return all staff records ordered by name. */
  listAll(): StaffDto[] {
    return this.db.select().from(staff).orderBy(staff.name).all()
  }

  /** Return a single staff record by id, or null if not found. */
  findById(id: string): StaffDto | null {
    const result = this.db.select().from(staff).where(eq(staff.id, id)).get()
    return result ?? null
  }

  /** Persist a new staff record and return it. */
  create(input: NewStaffInput): StaffDto {
    const now = new Date().toISOString()
    const record = { id: randomUUID(), ...input, createdAt: now }
    this.db.insert(staff).values(record).run()
    return record
  }

  /** Update an existing staff record and return the updated version. */
  update(id: string, input: Partial<NewStaffInput>): StaffDto {
    const now = new Date().toISOString()
    this.db.update(staff).set({ ...input, updatedAt: now }).where(eq(staff.id, id)).run()
    return this.findById(id)!
  }
}
```

**Import rules:**
- May import from: `domain`, `application/ports`, `application/dtos`, `shared`
- Must NOT import from: `ipc`, `renderer`, `container`
- The class may implement a port interface but must not extend it
  (TypeScript uses structural typing - matching method signatures is enough)

---

## Step 4 - DTO

**File:** `src/main/application/dtos/[entity]-dto.ts`

DTOs are the objects that cross the application-to-presentation boundary.
They are also what IPC sends over the wire (plain JSON-serializable objects).

```typescript
/** DTO and input types for the staff entity. */

/** Presentation-safe view of a staff record. */
export interface StaffDto {
  id: string
  name: string
  status: 'Active' | 'Inactive'
  createdAt: string
}

/** Fields required to create a new staff record. */
export interface NewStaffInput {
  name: string
  status: 'Active' | 'Inactive'
}
```

DTOs live in `application/dtos/` and can be imported by both `application`
and `infrastructure` layers. They are also re-exported from `src/shared/`
if the renderer needs them (via IPC types).

---

## Step 5 - Use case

**File:** `src/main/application/use-cases/[entity]/[action]-[entity]-use-case.ts`

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

## Step 6 - Wire the container

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

## Step 7 - IPC handler

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

## Step 8 - Register handlers + expose via preload

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

## Step 9 - Renderer API wrapper and hook

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

## Step 10 - Write tests

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
./make.ps1 test
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
