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
    expect(result.status).toBe('Active')
    expect(typeof result.id).toBe('string')
    expect(typeof result.createdAt).toBe('string')
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
})
