import { describe, it, expect, beforeEach } from 'vitest'
import { TaskRepository } from './task-repository'
import { createTestDatabase } from '../db/test-database'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { clients, projects, subjects, staff } from '../db/schema'

let db: BetterSQLite3Database
let repo: TaskRepository
const CLIENT_ID = 'client-1'
const PROJECT_ID = 'proj-1'
const SUBJECT_ID = 'subj-1'
const STAFF_ID = 'staff-1'

beforeEach(() => {
  db = createTestDatabase()
  const now = new Date().toISOString()
  db.insert(clients).values({ id: CLIENT_ID, name: 'Acme PAC', createdAt: now }).run()
  db.insert(projects)
    .values({
      id: PROJECT_ID,
      clientId: CLIENT_ID,
      name: 'CA Gov 2026',
      type: 'Candidate Campaign',
      status: 'Active',
      notes: null,
      createdAt: now,
      updatedAt: now
    })
    .run()
  db.insert(subjects)
    .values({
      id: SUBJECT_ID,
      projectId: PROJECT_ID,
      groupId: null,
      name: 'John Smith',
      type: 'Individual',
      role: 'Candidate',
      status: 'Active',
      notes: null,
      createdAt: now,
      updatedAt: now
    })
    .run()
  db.insert(staff)
    .values({ id: STAFF_ID, name: 'Alice', initials: 'A', status: 'Active', createdAt: now })
    .run()
  repo = new TaskRepository(db)
})

const newTask = () => ({
  subjectId: SUBJECT_ID,
  staffId: STAFF_ID,
  taskType: 'Research' as const,
  title: 'Check campaign finance',
  category: 'Finance' as const,
  status: 'Backlog' as const,
  priority: 'Normal' as const
})

describe('TaskRepository', () => {
  it('list returns an empty array when no tasks exist', () => {
    expect(repo.list({})).toEqual([])
  })

  it('create persists a task and returns it with joined names', () => {
    const result = repo.create(newTask())
    expect(result.title).toBe('Check campaign finance')
    expect(result.subjectName).toBe('John Smith')
    expect(result.projectName).toBe('CA Gov 2026')
    expect(result.staffName).toBe('Alice')
    expect(result.taskType).toBe('Research')
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
    repo.create(newTask())
    repo.create({ ...newTask(), title: 'In progress task', status: 'In Progress' })
    const backlog = repo.list({ status: 'Backlog' })
    expect(backlog.every(t => t.status === 'Backlog')).toBe(true)
    expect(backlog).toHaveLength(1)
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
    const updated = repo.updateStatus(created.id, 'Closed', closedAt)
    expect(updated.status).toBe('Closed')
    expect(updated.closedAt).toBe(closedAt)
  })

  it('updateStatus clears closedAt when status is not closed', () => {
    const created = repo.create(newTask())
    const updated = repo.updateStatus(created.id, 'In Progress', null)
    expect(updated.status).toBe('In Progress')
    expect(updated.closedAt).toBeNull()
  })

  it('update changes the title', () => {
    const created = repo.create(newTask())
    const updated = repo.update(created.id, { title: 'Updated title' })
    expect(updated.title).toBe('Updated title')
  })

  it('update with Closed status sets closedAt', () => {
    const created = repo.create(newTask())
    const updated = repo.update(created.id, { status: 'Closed' })
    expect(updated.status).toBe('Closed')
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

  it('list filters by deliverableId', () => {
    repo.create(newTask())
    const results = repo.list({ deliverableId: 'nonexistent' })
    expect(results).toHaveLength(0)
  })
})
