import { describe, it, expect, vi } from 'vitest'
import { ListTasksUseCase } from './list-tasks-use-case'
import type { TaskRepositoryPort } from '../../ports/task-repository-port'
import type { TaskDto } from '../../../../shared/dtos/task-dto'

const stubTask: TaskDto = {
  id: 'task-1',
  title: 'Research finance disclosures',
  scope: 'Full Memo',
  status: 'Backlog',
  priority: 'Normal',
  projectId: 'proj-1',
  projectName: 'CA Governor 2026',
  subprojectId: null,
  subprojectName: null,
  staffId: 'staff-1',
  staffName: 'Alice',
  dueDate: null,
  notes: null,
  closedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

const mockRepo: TaskRepositoryPort = {
  list: vi.fn().mockReturnValue([stubTask]),
  findById: vi.fn().mockReturnValue(null),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  delete: vi.fn(),
  countByStaff: vi.fn().mockReturnValue(0)
}

describe('ListTasksUseCase', () => {
  it('calls repo.list with no filters and returns results', () => {
    const useCase = new ListTasksUseCase(mockRepo)
    const result = useCase.execute()
    expect(mockRepo.list).toHaveBeenCalledWith({})
    expect(result).toEqual([stubTask])
  })

  it('passes filters through to repo.list', () => {
    const useCase = new ListTasksUseCase(mockRepo)
    const filters = { staffId: 'staff-1', projectId: 'proj-1' }
    useCase.execute(filters)
    expect(mockRepo.list).toHaveBeenCalledWith(filters)
  })

  it('returns an empty array when repo returns no records', () => {
    const emptyRepo: TaskRepositoryPort = { ...mockRepo, list: vi.fn().mockReturnValue([]) }
    const useCase = new ListTasksUseCase(emptyRepo)
    expect(useCase.execute()).toEqual([])
  })
})
