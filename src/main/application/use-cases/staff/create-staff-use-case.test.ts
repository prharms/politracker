import { describe, it, expect, vi } from 'vitest'
import { CreateStaffUseCase } from './create-staff-use-case'
import type { StaffRepositoryPort } from '../../ports/staff-repository-port'

const stubRecord = {
  id: '1',
  name: 'Alice',
  initials: 'A',
  status: 'Active' as const,
  createdAt: '2026-01-01'
}

const mockRepo: StaffRepositoryPort = {
  listAll: vi.fn().mockReturnValue([]),
  findById: vi.fn().mockReturnValue(null),
  create: vi.fn().mockReturnValue(stubRecord),
  update: vi.fn().mockReturnValue(stubRecord),
  updateStatus: vi.fn().mockReturnValue(stubRecord),
  delete: vi.fn()
}

describe('CreateStaffUseCase', () => {
  it('calls repo.create with the input and returns the new record', () => {
    const useCase = new CreateStaffUseCase(mockRepo)
    const result = useCase.execute({ name: 'Alice', status: 'Active' })
    expect(mockRepo.create).toHaveBeenCalledWith({ name: 'Alice', status: 'Active' })
    expect(result).toEqual(stubRecord)
  })

  it('throws when name is empty', () => {
    const useCase = new CreateStaffUseCase(mockRepo)
    expect(() => useCase.execute({ name: '  ', status: 'Active' })).toThrow(
      'Staff name must not be empty'
    )
  })
})
