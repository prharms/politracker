import { describe, it, expect, beforeEach } from 'vitest'
import { SubjectRepository } from './subject-repository'
import { ClientRepository } from './client-repository'
import { ProjectRepository } from './project-repository'
import { createTestDatabase } from '../db/test-database'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

let db: BetterSQLite3Database
let repo: SubjectRepository
let projectId: string

beforeEach(() => {
  db = createTestDatabase()
  repo = new SubjectRepository(db)
  const clientRepo = new ClientRepository(db)
  const projectRepo = new ProjectRepository(db)
  const client = clientRepo.create({ name: 'ACME' })
  const project = projectRepo.create({
    clientId: client.id,
    name: 'Test Project',
    type: 'Candidate Campaign',
    status: 'Active'
  })
  projectId = project.id
})

describe('SubjectRepository', () => {
  it('listAll returns empty array initially', () => {
    expect(repo.listAll()).toEqual([])
  })

  it('create persists a subject and returns it', () => {
    const result = repo.create({
      projectId,
      name: 'John Smith',
      type: 'Individual',
      status: 'Active'
    })
    expect(result.name).toBe('John Smith')
    expect(result.projectId).toBe(projectId)
    expect(result.type).toBe('Individual')
  })

  it('listAll returns all subjects with project name', () => {
    repo.create({ projectId, name: 'John Smith', type: 'Individual', status: 'Active' })
    const all = repo.listAll()
    expect(all).toHaveLength(1)
    expect(all[0]!.projectName).toBe('Test Project')
  })

  it('listByProject returns only subjects for that project', () => {
    repo.create({ projectId, name: 'John Smith', type: 'Individual', status: 'Active' })
    const results = repo.listByProject(projectId)
    expect(results).toHaveLength(1)
    expect(results[0]!.name).toBe('John Smith')
  })

  it('findById returns the correct record', () => {
    const created = repo.create({
      projectId,
      name: 'Jane Doe',
      type: 'Individual',
      status: 'Active'
    })
    expect(repo.findById(created.id)?.name).toBe('Jane Doe')
  })

  it('findById returns null for unknown id', () => {
    expect(repo.findById('nonexistent')).toBeNull()
  })

  it('update changes the name', () => {
    const created = repo.create({ projectId, name: 'Old', type: 'Individual', status: 'Active' })
    const updated = repo.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('update throws when record does not exist', () => {
    expect(() => repo.update('nonexistent', { name: 'X' })).toThrow('Subject record not found')
  })

  it('delete removes the record', () => {
    const created = repo.create({
      projectId,
      name: 'To Delete',
      type: 'Individual',
      status: 'Active'
    })
    repo.delete(created.id)
    expect(repo.findById(created.id)).toBeNull()
  })

  it('countTasks returns zero when no tasks assigned', () => {
    const created = repo.create({
      projectId,
      name: 'No Tasks',
      type: 'Individual',
      status: 'Active'
    })
    expect(repo.countTasks(created.id)).toBe(0)
  })
})
