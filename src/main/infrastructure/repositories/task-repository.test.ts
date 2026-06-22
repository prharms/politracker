import { describe, it, expect, beforeEach } from 'vitest'
import { TaskRepository } from './task-repository'
import { createTestDatabase } from '../db/test-database'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { projects, subprojects, staff } from '../db/schema'

let db: BetterSQLite3Database
let repo: TaskRepository
const PROJECT_ID = 'proj-1'
const SUBPROJECT_ID = 'sp-1'
const STAFF_ID = 'staff-1'

beforeEach(() => {
  db = createTestDatabase()
  const now = new Date().toISOString()
  db.insert(projects)
    .values({
      id: PROJECT_ID,
      name: 'CA Gov 2026',
      type: 'Candidate Campaign',
      status: 'Active',
      dueDate: '2026-11-03',
      notes: null,
      createdAt: now,
      updatedAt: now
    })
    .run()
  db.insert(subprojects)
    .values({
      id: SUBPROJECT_ID,
      projectId: PROJECT_ID,
      name: 'None',
      dueDate: null,
      createdAt: now
    })
    .run()
  db.insert(staff)
    .values({ id: STAFF_ID, name: 'Alice', initials: 'A', status: 'Active', createdAt: now })
    .run()
  repo = new TaskRepository(db)
})

/** Helper to build a valid new-task input. */
const newTask = () => ({
  projectId: PROJECT_ID,
  subprojectId: SUBPROJECT_ID,
  staffId: STAFF_ID,
  title: 'Check campaign finance',
  scope: 'Full Memo' as const,
  status: 'Active' as const,
  priority: 'Normal' as const,
  dueDate: '2026-11-03'
})

describe('TaskRepository', () => {
  it('list returns an empty array when no tasks exist', () => {
    expect(repo.list({})).toEqual([])
  })

  it('create persists a task and returns it with joined names', () => {
    const result = repo.create(newTask())
    expect(result.title).toBe('Check campaign finance')
    expect(result.projectName).toBe('CA Gov 2026')
    expect(result.staffName).toBe('Alice')
    expect(result.scope).toBe('Full Memo')
    expect(result.dueDate).toBe('2026-11-03')
  })

  it('list returns all tasks when no filters are given', () => {
    repo.create(newTask())
    repo.create({ ...newTask(), title: 'Review donor list' })
    expect(repo.list({})).toHaveLength(2)
  })

  it('list filters by staffId', () => {
    const task = repo.create(newTask())
    repo.create({ ...newTask(), staffId: undefined, title: 'Unassigned task' })
    const results = repo.list({ staffId: STAFF_ID })
    expect(results.every(t => t.staffId === STAFF_ID)).toBe(true)
    expect(results.some(t => t.id === task.id)).toBe(true)
  })

  it('list filters by projectId', () => {
    repo.create(newTask())
    const results = repo.list({ projectId: PROJECT_ID })
    expect(results.every(t => t.projectId === PROJECT_ID)).toBe(true)
  })

  it('list filters by status', () => {
    repo.create({ ...newTask(), status: 'Inactive' })
    repo.create({ ...newTask(), title: 'Active task', status: 'Active' })
    const active = repo.list({ status: 'Active' })
    expect(active.every(t => t.status === 'Active')).toBe(true)
    expect(active).toHaveLength(1)
  })

  it('findById returns the correct task', () => {
    const created = repo.create(newTask())
    const found = repo.findById(created.id)
    expect(found?.title).toBe('Check campaign finance')
  })

  it('findById returns null for an unknown id', () => {
    expect(repo.findById('nonexistent')).toBeNull()
  })

  it('updateStatus changes the status and sets closedAt', () => {
    const created = repo.create(newTask())
    const closedAt = new Date().toISOString()
    const updated = repo.updateStatus(created.id, 'Complete', closedAt)
    expect(updated.status).toBe('Complete')
    expect(updated.closedAt).toBe(closedAt)
  })

  it('updateStatus clears closedAt when status is not closed', () => {
    const created = repo.create(newTask())
    const updated = repo.updateStatus(created.id, 'Active', null)
    expect(updated.status).toBe('Active')
    expect(updated.closedAt).toBeNull()
  })

  it('update changes the title', () => {
    const created = repo.create(newTask())
    const updated = repo.update(created.id, { title: 'Updated title' })
    expect(updated.title).toBe('Updated title')
  })

  it('update changes the due date', () => {
    const created = repo.create(newTask())
    const updated = repo.update(created.id, { dueDate: '2027-01-01' })
    expect(updated.dueDate).toBe('2027-01-01')
  })

  it('update with Closed status sets closedAt', () => {
    const created = repo.create(newTask())
    const updated = repo.update(created.id, { status: 'Complete' })
    expect(updated.status).toBe('Complete')
    expect(updated.closedAt).not.toBeNull()
  })

  it('update throws when record does not exist', () => {
    expect(() => repo.update('nonexistent', { title: 'X' })).toThrow('Task record not found')
  })

  it('delete removes the task', () => {
    const created = repo.create(newTask())
    repo.delete(created.id)
    expect(repo.findById(created.id)).toBeNull()
  })

  it('countByStaff returns the number of tasks for a staff member', () => {
    repo.create(newTask())
    repo.create({ ...newTask(), title: 'Second task' })
    expect(repo.countByStaff(STAFF_ID)).toBe(2)
  })
})
