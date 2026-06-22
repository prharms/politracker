import { describe, it, expect, vi } from 'vitest'
import { ListSubprojectsUseCase } from './list-subprojects-use-case'
import { CreateSubprojectUseCase } from './create-subproject-use-case'
import { UpdateSubprojectUseCase } from './update-subproject-use-case'
import { DeleteSubprojectUseCase } from './delete-subproject-use-case'
import type { SubprojectRepositoryPort } from '../../ports/subproject-repository-port'

const stub = {
  id: 'sp-1',
  projectId: 'proj-1',
  name: 'Phase 1',
  createdAt: '2026-01-01T00:00:00.000Z'
}

const mockRepo = (): SubprojectRepositoryPort => ({
  list: vi.fn().mockReturnValue([stub]),
  create: vi.fn().mockReturnValue(stub),
  update: vi.fn().mockReturnValue({ ...stub, name: 'Phase 2' }),
  delete: vi.fn().mockReturnValue({ deleted: true }),
  countTasksBySubproject: vi.fn().mockReturnValue(0)
})

describe('ListSubprojectsUseCase', () => {
  it('returns all subprojects when no filter given', () => {
    const uc = new ListSubprojectsUseCase(mockRepo())
    expect(uc.execute()).toEqual([stub])
  })

  it('passes projectId filter to the repository', () => {
    const repo = mockRepo()
    new ListSubprojectsUseCase(repo).execute('proj-1')
    expect(repo.list).toHaveBeenCalledWith('proj-1')
  })
})

describe('CreateSubprojectUseCase', () => {
  it('creates a subproject and returns it', () => {
    const repo = mockRepo()
    const result = new CreateSubprojectUseCase(repo).execute({
      projectId: 'proj-1',
      name: 'Phase 1'
    })
    expect(repo.create).toHaveBeenCalledWith({ projectId: 'proj-1', name: 'Phase 1' })
    expect(result).toEqual(stub)
  })
})

describe('UpdateSubprojectUseCase', () => {
  it('updates a subproject and returns it', () => {
    const repo = mockRepo()
    const result = new UpdateSubprojectUseCase(repo).execute('sp-1', { name: 'Phase 2' })
    expect(repo.update).toHaveBeenCalledWith('sp-1', { name: 'Phase 2' })
    expect(result.name).toBe('Phase 2')
  })
})

describe('DeleteSubprojectUseCase', () => {
  it('delegates to the repository and returns the result', () => {
    const repo = mockRepo()
    const result = new DeleteSubprojectUseCase(repo).execute('sp-1')
    expect(repo.delete).toHaveBeenCalledWith('sp-1')
    expect(result).toEqual({ deleted: true })
  })

  it('returns not-deleted when the repository blocks deletion', () => {
    const repo = mockRepo()
    repo.delete = vi
      .fn()
      .mockReturnValue({ deleted: false, reason: 'Cannot delete: 2 task(s) assigned' })
    const result = new DeleteSubprojectUseCase(repo).execute('sp-1')
    expect(result.deleted).toBe(false)
  })
})
