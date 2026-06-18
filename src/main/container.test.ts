import { describe, it, expect } from 'vitest'
import {
  makeListStaffUseCase,
  makeCreateStaffUseCase,
  makeUpdateStaffStatusUseCase,
  makeListProjectsUseCase,
  makeListDeliverablesUseCase,
  makeListTasksUseCase
} from './container'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

const mockDb = {} as BetterSQLite3Database

describe('container factories', () => {
  it('makeListStaffUseCase returns a use case with an execute method', () => {
    const uc = makeListStaffUseCase(mockDb)
    expect(typeof uc.execute).toBe('function')
  })

  it('makeCreateStaffUseCase returns a use case with an execute method', () => {
    const uc = makeCreateStaffUseCase(mockDb)
    expect(typeof uc.execute).toBe('function')
  })

  it('makeUpdateStaffStatusUseCase returns a use case with an execute method', () => {
    const uc = makeUpdateStaffStatusUseCase(mockDb)
    expect(typeof uc.execute).toBe('function')
  })

  it('makeListProjectsUseCase returns a use case with an execute method', () => {
    const uc = makeListProjectsUseCase(mockDb)
    expect(typeof uc.execute).toBe('function')
  })

  it('makeListDeliverablesUseCase returns a use case with an execute method', () => {
    const uc = makeListDeliverablesUseCase(mockDb)
    expect(typeof uc.execute).toBe('function')
  })

  it('makeListTasksUseCase returns a use case with an execute method', () => {
    const uc = makeListTasksUseCase(mockDb)
    expect(typeof uc.execute).toBe('function')
  })
})
