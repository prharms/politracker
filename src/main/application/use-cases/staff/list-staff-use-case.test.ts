import { describe, it, expect, vi } from 'vitest'
import { ListStaffUseCase } from './list-staff-use-case'
import type { StaffRepositoryPort } from '../../ports/staff-repository-port'
import type { StaffDto } from '../../../../shared/dtos/staff-dto'

const stubStaff: StaffDto[] = [
  {
    id: '1',
    name: 'Alice',
    initials: 'A',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  { id: '2', name: 'Bob', initials: 'B', status: 'Active', createdAt: '2026-01-02T00:00:00.000Z' }
]

const mockRepo: StaffRepositoryPort = {
  listAll: vi.fn().mockReturnValue(stubStaff),
  findById: vi.fn().mockReturnValue(null),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  delete: vi.fn()
}

describe('ListStaffUseCase', () => {
  it('delegates to repo.listAll and returns the result', () => {
    const useCase = new ListStaffUseCase(mockRepo)
    const result = useCase.execute()
    expect(mockRepo.listAll).toHaveBeenCalledOnce()
    expect(result).toEqual(stubStaff)
  })

  it('returns an empty array when the repo returns no records', () => {
    const emptyRepo: StaffRepositoryPort = {
      ...mockRepo,
      listAll: vi.fn().mockReturnValue([])
    }
    const useCase = new ListStaffUseCase(emptyRepo)
    expect(useCase.execute()).toEqual([])
  })
})
