import { describe, it, expect, beforeEach } from 'vitest'
import { ProjectRepository } from './project-repository'
import { createTestDatabase } from '../db/test-database'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

let db: BetterSQLite3Database
let repo: ProjectRepository

beforeEach(() => {
  db = createTestDatabase()
  repo = new ProjectRepository(db)
})

/** Helper to create a project with a fixed due date. */
function newProject(name: string) {
  return {
    name,
    type: 'Candidate Campaign' as const,
    status: 'Active' as const,
    dueDate: '2026-11-03'
  }
}

describe('ProjectRepository', () => {
  it('listAll returns an empty array when no projects exist', () => {
    expect(repo.listAll()).toEqual([])
  })

  it('create persists a project and returns it', () => {
    const result = repo.create(newProject('CA Governor 2026'))
    expect(result.name).toBe('CA Governor 2026')
    expect(result.dueDate).toBe('2026-11-03')
    expect(result.type).toBe('Candidate Campaign')
    expect(result.status).toBe('Active')
  })

  it('listAll returns all created projects ordered by name', () => {
    repo.create(newProject('Z Project'))
    repo.create(newProject('A Project'))
    const all = repo.listAll()
    expect(all).toHaveLength(2)
    expect(all[0]!.name).toBe('A Project')
    expect(all[1]!.name).toBe('Z Project')
  })

  it('findById returns the correct project', () => {
    const created = repo.create(newProject('Test Project'))
    const found = repo.findById(created.id)
    expect(found?.name).toBe('Test Project')
    expect(found?.dueDate).toBe('2026-11-03')
  })

  it('findById returns null for an unknown id', () => {
    expect(repo.findById('nonexistent')).toBeNull()
  })

  it('update changes the project name', () => {
    const created = repo.create(newProject('Old'))
    const updated = repo.update(created.id, { name: 'New Name' })
    expect(updated.name).toBe('New Name')
  })

  it('update changes the due date', () => {
    const created = repo.create(newProject('P'))
    const updated = repo.update(created.id, { dueDate: '2027-01-01' })
    expect(updated.dueDate).toBe('2027-01-01')
  })

  it('update throws when the project does not exist', () => {
    expect(() => repo.update('nonexistent', { name: 'X' })).toThrow(
      'Project not found: nonexistent'
    )
  })

  it('delete removes the project', () => {
    const created = repo.create(newProject('Del'))
    repo.delete(created.id)
    expect(repo.findById(created.id)).toBeNull()
  })

  it('countTasks returns zero initially', () => {
    const created = repo.create(newProject('P'))
    expect(repo.countTasks(created.id)).toBe(0)
  })
})
