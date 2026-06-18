import { describe, it, expect, vi } from 'vitest'
import { CreateProjectUseCase } from './create-project-use-case'
import { UpdateProjectUseCase } from './update-project-use-case'
import { DeleteProjectUseCase } from './delete-project-use-case'
import type { ProjectRepositoryPort } from '../../ports/project-repository-port'

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

const mockRepo = (): ProjectRepositoryPort => ({
  listAll: vi.fn().mockReturnValue([stub]),
  findById: vi.fn().mockReturnValue(stub),
  create: vi.fn().mockReturnValue(stub),
  update: vi.fn().mockReturnValue({ ...stub, name: 'Updated' }),
  delete: vi.fn(),
  countSubjects: vi.fn().mockReturnValue(0)
})

describe('CreateProjectUseCase', () => {
  it('creates a project and returns it', () => {
    const repo = mockRepo()
    const result = new CreateProjectUseCase(repo).execute({
      clientId: 'c1',
      name: 'CA Gov 2026',
      type: 'Candidate Campaign',
      status: 'Active'
    })
    expect(repo.create).toHaveBeenCalled()
    expect(result).toEqual(stub)
  })

  it('throws when name is empty', () => {
    expect(() =>
      new CreateProjectUseCase(mockRepo()).execute({
        clientId: 'c1',
        name: '  ',
        type: 'Candidate Campaign',
        status: 'Active'
      })
    ).toThrow('Project name must not be empty')
  })

  it('throws when clientId is empty', () => {
    expect(() =>
      new CreateProjectUseCase(mockRepo()).execute({
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
  it('deletes when no subjects exist', () => {
    const repo = mockRepo()
    const result = new DeleteProjectUseCase(repo).execute('p1')
    expect(result).toEqual({ deleted: true, subjectCount: 0 })
    expect(repo.delete).toHaveBeenCalledWith('p1')
  })

  it('does not delete when subjects exist', () => {
    const repo = mockRepo()
    repo.countSubjects = vi.fn().mockReturnValue(2)
    const result = new DeleteProjectUseCase(repo).execute('p1')
    expect(result).toEqual({ deleted: false, subjectCount: 2 })
    expect(repo.delete).not.toHaveBeenCalled()
  })

  it('throws when id is empty', () => {
    expect(() => new DeleteProjectUseCase(mockRepo()).execute('  ')).toThrow(
      'Project id must not be empty'
    )
  })
})
