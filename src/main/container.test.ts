import { describe, it, expect } from 'vitest'
import {
  makeListSubprojectsUseCase,
  makeCreateSubprojectUseCase,
  makeUpdateSubprojectUseCase,
  makeDeleteSubprojectUseCase,
  makeListStaffUseCase,
  makeCreateStaffUseCase,
  makeUpdateStaffUseCase,
  makeUpdateStaffStatusUseCase,
  makeDeleteStaffUseCase,
  makeListProjectsUseCase,
  makeCreateProjectUseCase,
  makeUpdateProjectUseCase,
  makeDeleteProjectUseCase,
  makeListDeliverablesUseCase,
  makeListTasksUseCase,
  makeCreateTaskUseCase,
  makeUpdateTaskUseCase,
  makeDeleteTaskUseCase
} from './container'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

const mockDb = {} as BetterSQLite3Database

describe('container factories - subprojects', () => {
  it('makeListSubprojectsUseCase returns a use case with an execute method', () => {
    expect(typeof makeListSubprojectsUseCase(mockDb).execute).toBe('function')
  })

  it('makeCreateSubprojectUseCase returns a use case with an execute method', () => {
    expect(typeof makeCreateSubprojectUseCase(mockDb).execute).toBe('function')
  })

  it('makeUpdateSubprojectUseCase returns a use case with an execute method', () => {
    expect(typeof makeUpdateSubprojectUseCase(mockDb).execute).toBe('function')
  })

  it('makeDeleteSubprojectUseCase returns a use case with an execute method', () => {
    expect(typeof makeDeleteSubprojectUseCase(mockDb).execute).toBe('function')
  })
})

describe('container factories - staff', () => {
  it('makeListStaffUseCase returns a use case with an execute method', () => {
    expect(typeof makeListStaffUseCase(mockDb).execute).toBe('function')
  })

  it('makeCreateStaffUseCase returns a use case with an execute method', () => {
    expect(typeof makeCreateStaffUseCase(mockDb).execute).toBe('function')
  })

  it('makeUpdateStaffUseCase returns a use case with an execute method', () => {
    expect(typeof makeUpdateStaffUseCase(mockDb).execute).toBe('function')
  })

  it('makeUpdateStaffStatusUseCase returns a use case with an execute method', () => {
    expect(typeof makeUpdateStaffStatusUseCase(mockDb).execute).toBe('function')
  })

  it('makeDeleteStaffUseCase returns a use case with an execute method', () => {
    expect(typeof makeDeleteStaffUseCase(mockDb).execute).toBe('function')
  })
})

describe('container factories - projects', () => {
  it('makeListProjectsUseCase returns a use case with an execute method', () => {
    expect(typeof makeListProjectsUseCase(mockDb).execute).toBe('function')
  })

  it('makeCreateProjectUseCase returns a use case with an execute method', () => {
    expect(typeof makeCreateProjectUseCase(mockDb).execute).toBe('function')
  })

  it('makeUpdateProjectUseCase returns a use case with an execute method', () => {
    expect(typeof makeUpdateProjectUseCase(mockDb).execute).toBe('function')
  })

  it('makeDeleteProjectUseCase returns a use case with an execute method', () => {
    expect(typeof makeDeleteProjectUseCase(mockDb).execute).toBe('function')
  })
})

describe('container factories - deliverables and tasks', () => {
  it('makeListDeliverablesUseCase returns a use case with an execute method', () => {
    expect(typeof makeListDeliverablesUseCase(mockDb).execute).toBe('function')
  })

  it('makeListTasksUseCase returns a use case with an execute method', () => {
    expect(typeof makeListTasksUseCase(mockDb).execute).toBe('function')
  })

  it('makeCreateTaskUseCase returns a use case with an execute method', () => {
    expect(typeof makeCreateTaskUseCase(mockDb).execute).toBe('function')
  })

  it('makeUpdateTaskUseCase returns a use case with an execute method', () => {
    expect(typeof makeUpdateTaskUseCase(mockDb).execute).toBe('function')
  })

  it('makeDeleteTaskUseCase returns a use case with an execute method', () => {
    expect(typeof makeDeleteTaskUseCase(mockDb).execute).toBe('function')
  })
})
