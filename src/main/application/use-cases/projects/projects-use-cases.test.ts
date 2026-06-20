import { describe, it, expect, vi } from 'vitest'
import { CreateProjectUseCase } from './create-project-use-case'
import { UpdateProjectUseCase } from './update-project-use-case'
import { DeleteProjectUseCase } from './delete-project-use-case'
import type { ProjectRepositoryPort } from '../../ports/project-repository-port'
import type { SubprojectRepositoryPort } from '../../ports/subproject-repository-port'

const stub = {
  id: 'p1',
  clientId: 'c1',
  clientName: 'ACME',
  name: 'CA Gov 2026',
  type: 'Candidate Campaign' as const,
  status: 'Active' as const,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01'
}

const subprojectStub = { id: 'sp1', projectId: 'p1', name: 'None', createdAt: '2026-01-01' }

const mockRepo = (): ProjectRepositoryPort => ({
  listAll: vi.fn().mockReturnValue([stub]),
  findById: vi.fn().mockReturnValue(stub),
  create: vi.fn().mockReturnValue(stub),
  update: vi.fn().mockReturnValue({ ...stub, name: 'Updated' }),
  delete: vi.fn(),
  countTasks: vi.fn().mockReturnValue(0)
})

const mockSubprojectRepo = (): SubprojectRepositoryPort => ({
  list: vi.fn().mockReturnValue([subprojectStub]),
  create: vi.fn().mockReturnValue(subprojectStub),
  update: vi.fn().mockReturnValue(subprojectStub),
  delete: vi.fn().mockReturnValue({ deleted: true }),
  countTasksBySubproject: vi.fn().mockReturnValue(0)
})

describe('CreateProjectUseCase', () => {
  it('creates a project and returns it', () => {
    const repo = mockRepo()
    const subRepo = mockSubprojectRepo()
    const result = new CreateProjectUseCase(repo, subRepo).execute({
      clientId: 'c1',
      name: 'CA Gov 2026',
      type: 'Candidate Campaign',
      status: 'Active'
    })
    expect(repo.create).toHaveBeenCalled()
    expect(result).toEqual(stub)
  })

  it('auto-creates a None subproject after creating the project', () => {
    const repo = mockRepo()
    const subRepo = mockSubprojectRepo()
    new CreateProjectUseCase(repo, subRepo).execute({
      clientId: 'c1',
      name: 'CA Gov 2026',
      type: 'Candidate Campaign',
      status: 'Active'
    })
    expect(subRepo.create).toHaveBeenCalledWith({ projectId: 'p1', name: 'None' })
  })

  it('throws when name is empty', () => {
    expect(() =>
      new CreateProjectUseCase(mockRepo(), mockSubprojectRepo()).execute({
        clientId: 'c1',
        name: '  ',
        type: 'Candidate Campaign',
        status: 'Active'
      })
    ).toThrow('Project name must not be empty')
  })

  it('throws when clientId is empty', () => {
    expect(() =>
      new CreateProjectUseCase(mockRepo(), mockSubprojectRepo()).execute({
        clientId: '  ',
        name: 'X',
        type: 'Candidate Campaign',
        status: 'Active'
      })
    ).toThrow('Client id must not be empty')
  })
})

describe('UpdateProjectUseCase', () => {
  it('updates a project and returns it', () => {
    const repo = mockRepo()
    new UpdateProjectUseCase(repo).execute('p1', { name: 'Updated' })
    expect(repo.update).toHaveBeenCalledWith('p1', { name: 'Updated' })
  })

  it('throws when id is empty', () => {
    expect(() => new UpdateProjectUseCase(mockRepo()).execute('  ', { name: 'X' })).toThrow(
      'Project id must not be empty'
    )
  })

  it('throws when name is set to empty string', () => {
    expect(() => new UpdateProjectUseCase(mockRepo()).execute('p1', { name: '' })).toThrow(
      'Project name must not be empty'
    )
  })
})

describe('DeleteProjectUseCase', () => {
  it('deletes when no tasks exist', () => {
    const repo = mockRepo()
    const result = new DeleteProjectUseCase(repo).execute('p1')
    expect(result).toEqual({ deleted: true, taskCount: 0 })
    expect(repo.delete).toHaveBeenCalledWith('p1')
  })

  it('does not delete when tasks exist', () => {
    const repo = mockRepo()
    repo.countTasks = vi.fn().mockReturnValue(2)
    const result = new DeleteProjectUseCase(repo).execute('p1')
    expect(result).toEqual({ deleted: false, taskCount: 2 })
    expect(repo.delete).not.toHaveBeenCalled()
  })

  it('throws when id is empty', () => {
    expect(() => new DeleteProjectUseCase(mockRepo()).execute('  ')).toThrow(
      'Project id must not be empty'
    )
  })
})
