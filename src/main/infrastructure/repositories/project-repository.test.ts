import { describe, it, expect, beforeEach } from 'vitest'
import { ProjectRepository } from './project-repository'
import { createTestDatabase } from '../db/test-database'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { clients } from '../db/schema'

let db: BetterSQLite3Database
let repo: ProjectRepository
const CLIENT_ID = 'client-1'

beforeEach(() => {
  db = createTestDatabase()
  db.insert(clients)
    .values({ id: CLIENT_ID, name: 'Acme PAC', createdAt: new Date().toISOString() })
    .run()
  repo = new ProjectRepository(db)
})

describe('ProjectRepository', () => {
  it('listAll returns an empty array when no projects exist', () => {
    expect(repo.listAll()).toEqual([])
  })

  it('create persists a project and returns it with joined client name', () => {
    const result = repo.create({
      clientId: CLIENT_ID,
      name: 'CA Governor 2026',
      type: 'Candidate Campaign',
      status: 'Active'
    })
    expect(result.name).toBe('CA Governor 2026')
    expect(result.clientName).toBe('Acme PAC')
    expect(result.type).toBe('Candidate Campaign')
    expect(result.status).toBe('Active')
  })

  it('listAll returns all created projects ordered by name', () => {
    repo.create({
      clientId: CLIENT_ID,
      name: 'Z Project',
      type: 'Background Research',
      status: 'Active'
    })
    repo.create({
      clientId: CLIENT_ID,
      name: 'A Project',
      type: 'Ballot Measure',
      status: 'Active'
    })
    const all = repo.listAll()
    expect(all).toHaveLength(2)
    expect(all[0]!.name).toBe('A Project')
    expect(all[1]!.name).toBe('Z Project')
  })

  it('findById returns the correct project', () => {
    const created = repo.create({
      clientId: CLIENT_ID,
      name: 'Test Project',
      type: 'Background Research',
      status: 'Active'
    })
    const found = repo.findById(created.id)
    expect(found?.name).toBe('Test Project')
    expect(found?.clientName).toBe('Acme PAC')
  })

  it('findById returns null for an unknown id', () => {
    expect(repo.findById('nonexistent')).toBeNull()
  })
})
