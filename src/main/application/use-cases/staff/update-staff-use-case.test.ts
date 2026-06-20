import { describe, it, expect, vi } from 'vitest'
import { UpdateStaffUseCase } from './update-staff-use-case'
import type { StaffRepositoryPort } from '../../ports/staff-repository-port'

const mockRepo = (): StaffRepositoryPort => ({
  listAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi
    .fn()
    .mockReturnValue({ id: '1', name: 'Updated', initials: 'U', status: 'Active', createdAt: '' }),
  updateStatus: vi.fn(),
  delete: vi.fn()
})

describe('UpdateStaffUseCase', () => {
  it('calls repo.update and returns the updated record', () => {
    const repo = mockRepo()
    const uc = new UpdateStaffUseCase(repo)
    const result = uc.execute('1', { name: 'Updated' })
    expect(repo.update).toHaveBeenCalledWith('1', { name: 'Updated' })
    expect(result.name).toBe('Updated')
  })

  it('throws when id is empty', () => {
    const uc = new UpdateStaffUseCase(mockRepo())
    expect(() => uc.execute('  ', { name: 'X' })).toThrow('Staff id must not be empty')
  })

  it('throws when name is set to empty string', () => {
    const uc = new UpdateStaffUseCase(mockRepo())
    expect(() => uc.execute('1', { name: '  ' })).toThrow('Staff name must not be empty')
  })

  it('allows updating only initials without name', () => {
    const repo = mockRepo()
    const uc = new UpdateStaffUseCase(repo)
    uc.execute('1', { initials: 'AB' })
    expect(repo.update).toHaveBeenCalledWith('1', { initials: 'AB' })
  })
})
