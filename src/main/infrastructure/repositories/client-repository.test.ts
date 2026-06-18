import { describe, it, expect, beforeEach } from 'vitest'
import { ClientRepository } from './client-repository'
import { createTestDatabase } from '../db/test-database'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

let db: BetterSQLite3Database
let repo: ClientRepository

beforeEach(() => {
  db = createTestDatabase()
  repo = new ClientRepository(db)
})

describe('ClientRepository', () => {
  it('listAll returns empty array initially', () => {
    expect(repo.listAll()).toEqual([])
  })

  it('create persists a client and returns it', () => {
    const result = repo.create({ name: 'ACME Corp' })
    expect(result.name).toBe('ACME Corp')
    expect(typeof result.id).toBe('string')
    expect(typeof result.createdAt).toBe('string')
  })

  it('listAll returns clients sorted by name', () => {
    repo.create({ name: 'Zeta Inc' })
    repo.create({ name: 'Alpha LLC' })
    const all = repo.listAll()
    expect(all[0]!.name).toBe('Alpha LLC')
    expect(all[1]!.name).toBe('Zeta Inc')
  })

  it('findById returns the correct record', () => {
    const created = repo.create({ name: 'Test Client' })
    expect(repo.findById(created.id)?.name).toBe('Test Client')
  })

  it('findById returns null for unknown id', () => {
    expect(repo.findById('nonexistent')).toBeNull()
  })

  it('update changes the name', () => {
    const created = repo.create({ name: 'Old Name' })
    const updated = repo.update(created.id, { name: 'New Name' })
    expect(updated.name).toBe('New Name')
  })

  it('update throws when record does not exist', () => {
    expect(() => repo.update('nonexistent', { name: 'X' })).toThrow('Client record not found')
  })

  it('delete removes the record', () => {
    const created = repo.create({ name: 'To Delete' })
    repo.delete(created.id)
    expect(repo.findById(created.id)).toBeNull()
  })

  it('countProjects returns zero when no projects linked', () => {
    const created = repo.create({ name: 'No Projects' })
    expect(repo.countProjects(created.id)).toBe(0)
  })
})
