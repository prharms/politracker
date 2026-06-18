import { describe, it, expect, beforeEach } from 'vitest'
import { DeliverableRepository } from './deliverable-repository'
import { createTestDatabase } from '../db/test-database'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { clients, projects } from '../db/schema'

let db: BetterSQLite3Database
let repo: DeliverableRepository
const CLIENT_ID = 'client-1'
const PROJECT_ID = 'proj-1'
const PROJECT2_ID = 'proj-2'

beforeEach(() => {
  db = createTestDatabase()
  const now = new Date().toISOString()
  db.insert(clients).values({ id: CLIENT_ID, name: 'Acme PAC', createdAt: now }).run()
  db.insert(projects)
    .values({
      id: PROJECT_ID,
      clientId: CLIENT_ID,
      name: 'Project A',
      type: 'Background Research',
      status: 'Active',
      notes: undefined,
      createdAt: now,
      updatedAt: now
    })
    .run()
  db.insert(projects)
    .values({
      id: PROJECT2_ID,
      clientId: CLIENT_ID,
      name: 'Project B',
      type: 'Ballot Measure',
      status: 'Active',
      notes: undefined,
      createdAt: now,
      updatedAt: now
    })
    .run()
  repo = new DeliverableRepository(db)
})

const base = {
  type: 'Report' as const,
  title: 'Final Report',
  status: 'Draft' as const
}

describe('DeliverableRepository', () => {
  it('listAll returns an empty array when no deliverables exist', () => {
    expect(repo.listAll()).toEqual([])
  })

  it('create persists a deliverable and returns it', () => {
    const result = repo.create({ projectId: PROJECT_ID, ...base })
    expect(result.title).toBe('Final Report')
    expect(result.type).toBe('Report')
    expect(result.projectId).toBe(PROJECT_ID)
    expect(result.projectName).toBe('Project A')
  })

  it('listAll returns deliverables across all projects', () => {
    repo.create({ projectId: PROJECT_ID, ...base, title: 'Report A' })
    repo.create({ projectId: PROJECT2_ID, ...base, type: 'Memo', title: 'Memo B' })
    expect(repo.listAll()).toHaveLength(2)
  })

  it('listByProject filters to the given project', () => {
    repo.create({ projectId: PROJECT_ID, ...base, title: 'Report A' })
    repo.create({ projectId: PROJECT2_ID, ...base, type: 'Memo', title: 'Memo B' })
    const results = repo.listByProject(PROJECT_ID)
    expect(results).toHaveLength(1)
    expect(results[0]!.title).toBe('Report A')
  })

  it('findById returns the correct deliverable', () => {
    const created = repo.create({ projectId: PROJECT_ID, ...base, type: 'Memo', title: 'My Memo' })
    const found = repo.findById(created.id)
    expect(found?.title).toBe('My Memo')
  })

  it('findById returns null for an unknown id', () => {
    expect(repo.findById('nonexistent')).toBeNull()
  })
})
