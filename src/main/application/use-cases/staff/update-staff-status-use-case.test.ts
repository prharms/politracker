import { describe, it, expect, vi } from 'vitest'
import { UpdateStaffStatusUseCase } from './update-staff-status-use-case'
import type { StaffRepositoryPort } from '../../ports/staff-repository-port'

const stubRecord = {
  id: 'abc',
  name: 'Alice',
  initials: 'A',
  status: 'Inactive' as const,
  createdAt: '2026-01-01'
}

const mockRepo: StaffRepositoryPort = {
  listAll: vi.fn().mockReturnValue([]),
  findById: vi.fn().mockReturnValue(null),
  create: vi.fn(),
  update: vi.fn().mockReturnValue(stubRecord),
  updateStatus: vi.fn().mockReturnValue(stubRecord),
  delete: vi.fn()
}

describe('UpdateStaffStatusUseCase', () => {
  it('calls repo.updateStatus and returns the updated record', () => {
    const useCase = new UpdateStaffStatusUseCase(mockRepo)
    const result = useCase.execute('abc', 'Inactive')
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('abc', 'Inactive')
    expect(result).toEqual(stubRecord)
  })

  it('throws when id is empty', () => {
    const useCase = new UpdateStaffStatusUseCase(mockRepo)
    expect(() => useCase.execute('  ', 'Active')).toThrow('Staff id must not be empty')
  })
})
