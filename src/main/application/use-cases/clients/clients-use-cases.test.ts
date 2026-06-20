import { describe, it, expect, vi } from 'vitest'
import { ListClientsUseCase } from './list-clients-use-case'
import { CreateClientUseCase } from './create-client-use-case'
import { UpdateClientUseCase } from './update-client-use-case'
import { DeleteClientUseCase } from './delete-client-use-case'
import type { ClientRepositoryPort } from '../../ports/client-repository-port'

const stub = { id: '1', name: 'ACME', createdAt: '2026-01-01' }

const mockRepo = (): ClientRepositoryPort => ({
  listAll: vi.fn().mockReturnValue([stub]),
  findById: vi.fn().mockReturnValue(stub),
  create: vi.fn().mockReturnValue(stub),
  update: vi.fn().mockReturnValue({ ...stub, name: 'ACME 2' }),
  delete: vi.fn(),
  countProjects: vi.fn().mockReturnValue(0)
})

describe('ListClientsUseCase', () => {
  it('returns all clients', () => {
    expect(new ListClientsUseCase(mockRepo()).execute()).toEqual([stub])
  })
})

describe('CreateClientUseCase', () => {
  it('creates a client and returns it', () => {
    const repo = mockRepo()
    const result = new CreateClientUseCase(repo).execute({ name: 'ACME' })
    expect(repo.create).toHaveBeenCalledWith({ name: 'ACME' })
    expect(result).toEqual(stub)
  })

  it('throws when name is empty', () => {
    expect(() => new CreateClientUseCase(mockRepo()).execute({ name: '  ' })).toThrow(
      'Client name must not be empty'
    )
  })
})

describe('UpdateClientUseCase', () => {
  it('updates a client and returns it', () => {
    const repo = mockRepo()
    const result = new UpdateClientUseCase(repo).execute('1', { name: 'ACME 2' })
    expect(repo.update).toHaveBeenCalledWith('1', { name: 'ACME 2' })
    expect(result.name).toBe('ACME 2')
  })

  it('throws when id is empty', () => {
    expect(() => new UpdateClientUseCase(mockRepo()).execute('  ', { name: 'X' })).toThrow(
      'Client id must not be empty'
    )
  })

  it('throws when name is empty', () => {
    expect(() => new UpdateClientUseCase(mockRepo()).execute('1', { name: '' })).toThrow(
      'Client name must not be empty'
    )
  })
})

describe('DeleteClientUseCase', () => {
  it('deletes when no projects linked', () => {
    const repo = mockRepo()
    const result = new DeleteClientUseCase(repo).execute('1')
    expect(result).toEqual({ deleted: true, projectCount: 0 })
    expect(repo.delete).toHaveBeenCalledWith('1')
  })

  it('does not delete when projects exist', () => {
    const repo = mockRepo()
    repo.countProjects = vi.fn().mockReturnValue(2)
    const result = new DeleteClientUseCase(repo).execute('1')
    expect(result).toEqual({ deleted: false, projectCount: 2 })
    expect(repo.delete).not.toHaveBeenCalled()
  })

  it('throws when id is empty', () => {
    expect(() => new DeleteClientUseCase(mockRepo()).execute('  ')).toThrow(
      'Client id must not be empty'
    )
  })
})
