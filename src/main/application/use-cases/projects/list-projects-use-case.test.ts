import { describe, it, expect, vi } from 'vitest'
import { ListProjectsUseCase } from './list-projects-use-case'
import type { ProjectRepositoryPort } from '../../ports/project-repository-port'
import type { ProjectDto } from '../../../../shared/dtos/project-dto'

const stubProject: ProjectDto = {
  id: 'proj-1',
  clientId: 'client-1',
  clientName: 'Smith for Governor',
  name: 'CA Governor 2026',
  type: 'Candidate Campaign',
  status: 'Active',
  notes: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

const mockRepo: ProjectRepositoryPort = {
  listAll: vi.fn().mockReturnValue([stubProject]),
  findById: vi.fn().mockReturnValue(null),
  create: vi.fn()
}

describe('ListProjectsUseCase', () => {
  it('calls repo.listAll and returns results', () => {
    const useCase = new ListProjectsUseCase(mockRepo)
    const result = useCase.execute()
    expect(mockRepo.listAll).toHaveBeenCalled()
    expect(result).toEqual([stubProject])
  })

  it('returns an empty array when the repo returns no records', () => {
    const emptyRepo: ProjectRepositoryPort = { ...mockRepo, listAll: vi.fn().mockReturnValue([]) }
    const useCase = new ListProjectsUseCase(emptyRepo)
    expect(useCase.execute()).toEqual([])
  })
})
