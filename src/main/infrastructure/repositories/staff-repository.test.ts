import { describe, it, expect, beforeEach } from 'vitest'
import { StaffRepository } from './staff-repository'
import { createTestDatabase } from '../db/test-database'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

let db: BetterSQLite3Database
let repo: StaffRepository

beforeEach(() => {
  db = createTestDatabase()
  repo = new StaffRepository(db)
})

describe('StaffRepository', () => {
  it('listAll returns an empty array when no staff exist', () => {
    expect(repo.listAll()).toEqual([])
  })

  it('create persists a staff record and returns it', () => {
    const result = repo.create({ name: 'Alice', status: 'Active' })
    expect(result.name).toBe('Alice')
    expect(result.initials).toBe('A')
    expect(result.status).toBe('Active')
    expect(typeof result.id).toBe('string')
    expect(typeof result.createdAt).toBe('string')
  })

  it('create derives initials from name when not provided', () => {
    const result = repo.create({ name: 'Paul Harms', status: 'Active' })
    expect(result.initials).toBe('PH')
  })

  it('create uses provided initials when given', () => {
    const result = repo.create({ name: 'Paul Harms', initials: 'PHX', status: 'Active' })
    expect(result.initials).toBe('PHX')
  })

  it('listAll returns all created staff ordered by name', () => {
    repo.create({ name: 'Zara', status: 'Active' })
    repo.create({ name: 'Alice', status: 'Active' })
    const all = repo.listAll()
    expect(all).toHaveLength(2)
    expect(all[0]!.name).toBe('Alice')
    expect(all[1]!.name).toBe('Zara')
  })

  it('findById returns the correct staff record', () => {
    const created = repo.create({ name: 'Bob', status: 'Active' })
    const found = repo.findById(created.id)
    expect(found?.name).toBe('Bob')
  })

  it('findById returns null for an unknown id', () => {
    expect(repo.findById('nonexistent')).toBeNull()
  })

  it('update changes the name and re-derives initials', () => {
    const created = repo.create({ name: 'Carol Smith', status: 'Active' })
    const updated = repo.update(created.id, { name: 'Carol Jones' })
    expect(updated.name).toBe('Carol Jones')
    expect(updated.initials).toBe('CJ')
  })

  it('update can change initials independently', () => {
    const created = repo.create({ name: 'Dave Brown', status: 'Active' })
    const updated = repo.update(created.id, { initials: 'DB2' })
    expect(updated.initials).toBe('DB2')
    expect(updated.name).toBe('Dave Brown')
  })

  it('update throws when record does not exist', () => {
    expect(() => repo.update('nonexistent', { name: 'X' })).toThrow('Staff record not found')
  })

  it('updateStatus changes the status of the given record', () => {
    const created = repo.create({ name: 'Carol', status: 'Active' })
    const updated = repo.updateStatus(created.id, 'Inactive')
    expect(updated.id).toBe(created.id)
    expect(updated.status).toBe('Inactive')
  })

  it('updateStatus returns the full updated record', () => {
    const created = repo.create({ name: 'Dave', status: 'Inactive' })
    const updated = repo.updateStatus(created.id, 'Active')
    expect(updated.name).toBe('Dave')
    expect(updated.status).toBe('Active')
  })

  it('delete removes the record', () => {
    const created = repo.create({ name: 'Eve', status: 'Active' })
    repo.delete(created.id)
    expect(repo.findById(created.id)).toBeNull()
  })

  it('delete on nonexistent id does not throw', () => {
    expect(() => repo.delete('nonexistent')).not.toThrow()
  })
})
