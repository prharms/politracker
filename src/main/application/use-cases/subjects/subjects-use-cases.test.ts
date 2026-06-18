import { describe, it, expect, vi } from 'vitest'
import { ListSubjectsUseCase } from './list-subjects-use-case'
import { CreateSubjectUseCase } from './create-subject-use-case'
import { UpdateSubjectUseCase } from './update-subject-use-case'
import { DeleteSubjectUseCase } from './delete-subject-use-case'
import type { SubjectRepositoryPort } from '../../ports/subject-repository-port'

const stub = {
  id: 's1',
  projectId: 'p1',
  projectName: 'Project A',
  name: 'John Smith',
  type: 'Individual' as const,
  status: 'Active' as const,
  notes: null,
  createdAt: '2026-01-01'
}

const mockRepo = (): SubjectRepositoryPort => ({
  listAll: vi.fn().mockReturnValue([stub]),
  listByProject: vi.fn().mockReturnValue([stub]),
  findById: vi.fn().mockReturnValue(stub),
  create: vi.fn().mockReturnValue(stub),
  update: vi.fn().mockReturnValue({ ...stub, name: 'Jane Smith' }),
  delete: vi.fn(),
  countTasks: vi.fn().mockReturnValue(0)
})

describe('ListSubjectsUseCase', () => {
  it('returns all subjects when no projectId provided', () => {
    const repo = mockRepo()
    new ListSubjectsUseCase(repo).execute()
    expect(repo.listAll).toHaveBeenCalled()
  })

  it('returns subjects filtered by project when projectId provided', () => {
    const repo = mockRepo()
    new ListSubjectsUseCase(repo).execute('p1')
    expect(repo.listByProject).toHaveBeenCalledWith('p1')
  })
})

describe('CreateSubjectUseCase', () => {
  it('creates a subject and returns it', () => {
    const repo = mockRepo()
    const result = new CreateSubjectUseCase(repo).execute({
      projectId: 'p1',
      name: 'John Smith',
      type: 'Individual',
      status: 'Active'
    })
    expect(repo.create).toHaveBeenCalled()
    expect(result).toEqual(stub)
  })

  it('throws when name is empty', () => {
    expect(() =>
      new CreateSubjectUseCase(mockRepo()).execute({
        projectId: 'p1',
        name: '  ',
        type: 'Individual',
        status: 'Active'
      })
    ).toThrow('Subject name must not be empty')
  })

  it('throws when projectId is empty', () => {
    expect(() =>
      new CreateSubjectUseCase(mockRepo()).execute({
        projectId: '  ',
        name: 'John',
        type: 'Individual',
        status: 'Active'
      })
    ).toThrow('Project id must not be empty')
  })
})

describe('UpdateSubjectUseCase', () => {
  it('updates a subject', () => {
    const repo = mockRepo()
    new UpdateSubjectUseCase(repo).execute('s1', { name: 'Jane Smith' })
    expect(repo.update).toHaveBeenCalledWith('s1', { name: 'Jane Smith' })
  })

  it('throws when id is empty', () => {
    expect(() => new UpdateSubjectUseCase(mockRepo()).execute('  ', { name: 'X' })).toThrow(
      'Subject id must not be empty'
    )
  })

  it('throws when name is set to empty string', () => {
    expect(() => new UpdateSubjectUseCase(mockRepo()).execute('s1', { name: '' })).toThrow(
      'Subject name must not be empty'
    )
  })
})

describe('DeleteSubjectUseCase', () => {
  it('deletes when no tasks assigned', () => {
    const repo = mockRepo()
    const result = new DeleteSubjectUseCase(repo).execute('s1')
    expect(result).toEqual({ deleted: true, taskCount: 0 })
    expect(repo.delete).toHaveBeenCalledWith('s1')
  })

  it('does not delete when tasks exist', () => {
    const repo = mockRepo()
    repo.countTasks = vi.fn().mockReturnValue(3)
    const result = new DeleteSubjectUseCase(repo).execute('s1')
    expect(result).toEqual({ deleted: false, taskCount: 3 })
    expect(repo.delete).not.toHaveBeenCalled()
  })

  it('throws when id is empty', () => {
    expect(() => new DeleteSubjectUseCase(mockRepo()).execute('  ')).toThrow(
      'Subject id must not be empty'
    )
  })
})
