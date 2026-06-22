import { describe, it, expect, vi } from 'vitest'
import { ListDeliverablesUseCase } from './list-deliverables-use-case'
import type { DeliverableRepositoryPort } from '../../ports/deliverable-repository-port'
import type { DeliverableDto } from '../../../../shared/dtos/deliverable-dto'

const stubDeliverable: DeliverableDto = {
  id: 'del-1',
  projectId: 'proj-1',
  projectName: 'CA Governor 2026',
  parentDeliverableId: null,
  subprojectId: null,
  type: 'Report',
  title: 'Final Background Report',
  status: 'Draft',
  dueDate: null,
  notes: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

const mockRepo: DeliverableRepositoryPort = {
  listByProject: vi.fn().mockReturnValue([stubDeliverable]),
  listAll: vi.fn().mockReturnValue([stubDeliverable]),
  findById: vi.fn().mockReturnValue(null),
  create: vi.fn()
}

describe('ListDeliverablesUseCase', () => {
  it('calls listAll when no projectId is given', () => {
    const useCase = new ListDeliverablesUseCase(mockRepo)
    const result = useCase.execute()
    expect(mockRepo.listAll).toHaveBeenCalled()
    expect(result).toEqual([stubDeliverable])
  })

  it('calls listByProject when a projectId is given', () => {
    const useCase = new ListDeliverablesUseCase(mockRepo)
    const result = useCase.execute('proj-1')
    expect(mockRepo.listByProject).toHaveBeenCalledWith('proj-1')
    expect(result).toEqual([stubDeliverable])
  })

  it('returns an empty array when the repo returns no records', () => {
    const emptyRepo: DeliverableRepositoryPort = {
      ...mockRepo,
      listAll: vi.fn().mockReturnValue([])
    }
    const useCase = new ListDeliverablesUseCase(emptyRepo)
    expect(useCase.execute()).toEqual([])
  })
})
