import { describe, it, expect, vi } from 'vitest'
import { CreateTaskUseCase } from './create-task-use-case'
import { UpdateTaskUseCase } from './update-task-use-case'
import { DeleteTaskUseCase } from './delete-task-use-case'
import type { TaskRepositoryPort } from '../../ports/task-repository-port'

const stub = {
  id: 't1',
  title: 'Research finances',
  scope: 'Full Memo' as const,
  status: 'Backlog' as const,
  priority: 'Normal' as const,
  projectId: 'p1',
  projectName: 'CA Gov 2026',
  subprojectId: 'sp1',
  subprojectName: 'None',
  staffId: null,
  staffName: null,
  dueDate: '2026-11-03',
  notes: null,
  closedAt: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01'
}

const mockRepo = (): TaskRepositoryPort => ({
  list: vi.fn().mockReturnValue([stub]),
  findById: vi.fn().mockReturnValue(stub),
  create: vi.fn().mockReturnValue(stub),
  update: vi.fn().mockReturnValue({ ...stub, title: 'Updated' }),
  updateStatus: vi.fn().mockReturnValue(stub),
  delete: vi.fn(),
  countByStaff: vi.fn().mockReturnValue(0)
})

describe('CreateTaskUseCase', () => {
  it('creates a task and returns it', () => {
    const repo = mockRepo()
    const result = new CreateTaskUseCase(repo).execute({
      projectId: 'p1',
      subprojectId: 'sp1',
      title: 'Research finances',
      scope: 'Full Memo',
      status: 'Backlog',
      priority: 'Normal',
      dueDate: '2026-11-03'
    })
    expect(repo.create).toHaveBeenCalled()
    expect(result).toEqual(stub)
  })

  it('throws when title is empty', () => {
    expect(() =>
      new CreateTaskUseCase(mockRepo()).execute({
        projectId: 'p1',
        subprojectId: 'sp1',
        title: '  ',
        scope: 'Full Memo',
        status: 'Backlog',
        priority: 'Normal',
        dueDate: '2026-11-03'
      })
    ).toThrow('Task title must not be empty')
  })

  it('throws when projectId is empty', () => {
    expect(() =>
      new CreateTaskUseCase(mockRepo()).execute({
        projectId: '  ',
        subprojectId: 'sp1',
        title: 'X',
        scope: 'Full Memo',
        status: 'Backlog',
        priority: 'Normal',
        dueDate: '2026-11-03'
      })
    ).toThrow('Project id must not be empty')
  })

  it('throws when subprojectId is empty', () => {
    expect(() =>
      new CreateTaskUseCase(mockRepo()).execute({
        projectId: 'p1',
        subprojectId: '  ',
        title: 'X',
        scope: 'Full Memo',
        status: 'Backlog',
        priority: 'Normal',
        dueDate: '2026-11-03'
      })
    ).toThrow('Subproject id must not be empty')
  })

  it('throws when due date is missing', () => {
    expect(() =>
      new CreateTaskUseCase(mockRepo()).execute({
        projectId: 'p1',
        subprojectId: 'sp1',
        title: 'X',
        scope: 'Full Memo',
        status: 'Backlog',
        priority: 'Normal',
        dueDate: ''
      })
    ).toThrow('Due date is required')
  })
})

describe('UpdateTaskUseCase', () => {
  it('updates a task and returns it', () => {
    const repo = mockRepo()
    new UpdateTaskUseCase(repo).execute('t1', { title: 'Updated' })
    expect(repo.update).toHaveBeenCalledWith('t1', { title: 'Updated' })
  })

  it('throws when id is empty', () => {
    expect(() => new UpdateTaskUseCase(mockRepo()).execute('  ', { title: 'X' })).toThrow(
      'Task id must not be empty'
    )
  })

  it('throws when title is set to empty string', () => {
    expect(() => new UpdateTaskUseCase(mockRepo()).execute('t1', { title: '' })).toThrow(
      'Task title must not be empty'
    )
  })
})

describe('DeleteTaskUseCase', () => {
  it('deletes a task and returns deleted true', () => {
    const repo = mockRepo()
    const result = new DeleteTaskUseCase(repo).execute('t1')
    expect(result).toEqual({ deleted: true })
    expect(repo.delete).toHaveBeenCalledWith('t1')
  })

  it('throws when id is empty', () => {
    expect(() => new DeleteTaskUseCase(mockRepo()).execute('  ')).toThrow(
      'Task id must not be empty'
    )
  })
})
