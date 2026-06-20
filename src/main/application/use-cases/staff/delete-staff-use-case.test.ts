import { describe, it, expect, vi } from 'vitest'
import { DeleteStaffUseCase } from './delete-staff-use-case'
import type { StaffRepositoryPort } from '../../ports/staff-repository-port'
import type { TaskRepositoryPort } from '../../ports/task-repository-port'

const mockStaffRepo = (): StaffRepositoryPort => ({
  listAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  delete: vi.fn()
})

const mockTaskRepo = (taskCount: number): TaskRepositoryPort => ({
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  delete: vi.fn(),
  countByStaff: vi.fn().mockReturnValue(taskCount)
})

describe('DeleteStaffUseCase', () => {
  it('deletes when no tasks are assigned', () => {
    const staffRepo = mockStaffRepo()
    const uc = new DeleteStaffUseCase(staffRepo, mockTaskRepo(0))
    const result = uc.execute('abc-123')
    expect(result.deleted).toBe(true)
    expect(result.taskCount).toBe(0)
    expect(staffRepo.delete).toHaveBeenCalledWith('abc-123')
  })

  it('does not delete when tasks are assigned', () => {
    const staffRepo = mockStaffRepo()
    const uc = new DeleteStaffUseCase(staffRepo, mockTaskRepo(3))
    const result = uc.execute('abc-123')
    expect(result.deleted).toBe(false)
    expect(result.taskCount).toBe(3)
    expect(staffRepo.delete).not.toHaveBeenCalled()
  })

  it('throws when id is empty', () => {
    const uc = new DeleteStaffUseCase(mockStaffRepo(), mockTaskRepo(0))
    expect(() => uc.execute('  ')).toThrow('Staff id must not be empty')
  })
})
