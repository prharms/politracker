import { describe, it, expect, beforeEach } from 'vitest'
import { SubprojectRepository } from './subproject-repository'
import { TaskRepository } from './task-repository'
import { ProjectRepository } from './project-repository'
import { createTestDatabase } from '../db/test-database'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

let db: BetterSQLite3Database
let repo: SubprojectRepository

beforeEach(() => {
  db = createTestDatabase()
  repo = new SubprojectRepository(db)
})

/** Helper: create a project so FK constraints pass. */
function seedProject(): string {
  const projectRepo = new ProjectRepository(db)
  const p = projectRepo.create({
    name: 'Test Project',
    type: 'Background Research',
    status: 'Active',
    dueDate: '2026-11-03'
  })
  return p.id
}

describe('SubprojectRepository', () => {
  it('list returns empty array initially', () => {
    expect(repo.list()).toEqual([])
  })

  it('create persists a subproject and returns it', () => {
    const projectId = seedProject()
    const result = repo.create({ projectId, name: 'Phase 1', dueDate: '2026-11-03' })
    expect(result.name).toBe('Phase 1')
    expect(result.projectId).toBe(projectId)
    expect(result.dueDate).toBe('2026-11-03')
    expect(typeof result.id).toBe('string')
  })

  it('create persists a default None subproject without a due date', () => {
    const projectId = seedProject()
    const result = repo.create({ projectId, name: 'None' })
    expect(result.name).toBe('None')
    expect(result.dueDate).toBeNull()
  })

  it('list returns subprojects ordered by name', () => {
    const projectId = seedProject()
    repo.create({ projectId, name: 'Zebra Phase', dueDate: '2026-11-03' })
    repo.create({ projectId, name: 'Alpha Phase', dueDate: '2026-11-03' })
    const all = repo.list()
    expect(all[0]!.name).toBe('Alpha Phase')
    expect(all[1]!.name).toBe('Zebra Phase')
  })

  it('list filters by projectId', () => {
    const p1 = seedProject()
    const p2 = seedProject()
    repo.create({ projectId: p1, name: 'SP One', dueDate: '2026-11-03' })
    repo.create({ projectId: p2, name: 'SP Two', dueDate: '2026-11-03' })
    const filtered = repo.list(p1)
    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.name).toBe('SP One')
  })

  it('update changes the name', () => {
    const projectId = seedProject()
    const created = repo.create({ projectId, name: 'Old Name', dueDate: '2026-11-03' })
    const updated = repo.update(created.id, { name: 'New Name' })
    expect(updated.name).toBe('New Name')
  })

  it('update changes the due date', () => {
    const projectId = seedProject()
    const created = repo.create({ projectId, name: 'SP', dueDate: '2026-11-03' })
    const updated = repo.update(created.id, { dueDate: '2027-01-01' })
    expect(updated.dueDate).toBe('2027-01-01')
  })

  it('update throws when record does not exist', () => {
    expect(() => repo.update('nonexistent', { name: 'X' })).toThrow(
      'Subproject not found: nonexistent'
    )
  })

  it('delete removes the record when no tasks linked', () => {
    const projectId = seedProject()
    const created = repo.create({ projectId, name: 'To Delete', dueDate: '2026-11-03' })
    const result = repo.delete(created.id)
    expect(result).toEqual({ deleted: true })
    expect(repo.list()).toHaveLength(0)
  })

  it('delete blocks removal when tasks are linked', () => {
    const projectId = seedProject()
    const sp = repo.create({ projectId, name: 'Has Tasks', dueDate: '2026-11-03' })
    const taskRepo = new TaskRepository(db)
    taskRepo.create({
      projectId,
      subprojectId: sp.id,
      title: 'Task A',
      scope: 'Full Memo',
      priority: 'Normal',
      status: 'Active',
      dueDate: '2026-11-03'
    })
    const result = repo.delete(sp.id)
    expect(result.deleted).toBe(false)
    expect(result.reason).toMatch(/task/)
  })

  it('countTasksBySubproject returns the correct count', () => {
    const projectId = seedProject()
    const sp = repo.create({ projectId, name: 'Counted', dueDate: '2026-11-03' })
    expect(repo.countTasksBySubproject(sp.id)).toBe(0)
    const taskRepo = new TaskRepository(db)
    taskRepo.create({
      projectId,
      subprojectId: sp.id,
      title: 'T1',
      scope: 'Full Memo',
      priority: 'Normal',
      status: 'Active',
      dueDate: '2026-11-03'
    })
    expect(repo.countTasksBySubproject(sp.id)).toBe(1)
  })
})
