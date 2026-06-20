import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }))

import { ipcMain } from 'electron'
import { registerTaskHandlers } from './task-handlers'
import type { ListTasksUseCase } from '../../application/use-cases/tasks/list-tasks-use-case'
import type { CreateTaskUseCase } from '../../application/use-cases/tasks/create-task-use-case'
import type { UpdateTaskUseCase } from '../../application/use-cases/tasks/update-task-use-case'
import type { DeleteTaskUseCase } from '../../application/use-cases/tasks/delete-task-use-case'

const mockList = { execute: vi.fn().mockReturnValue([]) } as unknown as ListTasksUseCase
const mockCreate = { execute: vi.fn().mockReturnValue({}) } as unknown as CreateTaskUseCase
const mockUpdate = { execute: vi.fn().mockReturnValue({}) } as unknown as UpdateTaskUseCase
const mockDelete = {
  execute: vi.fn().mockReturnValue({ deleted: true })
} as unknown as DeleteTaskUseCase

function captureHandler(channel: string) {
  const calls = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls
  const found = calls.find((c: unknown[]) => c[0] === channel)
  return found?.[1] as ((...args: unknown[]) => unknown) | undefined
}

describe('registerTaskHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    registerTaskHandlers(mockList, mockCreate, mockUpdate, mockDelete)
  })

  it('registers all four task IPC channels', () => {
    const channels = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0]
    )
    expect(channels).toContain('tasks:list')
    expect(channels).toContain('tasks:create')
    expect(channels).toContain('tasks:update')
    expect(channels).toContain('tasks:delete')
  })

  it('tasks:list handler invokes use case with filters', () => {
    captureHandler('tasks:list')?.({}, { status: 'Backlog' })
    expect(mockList.execute).toHaveBeenCalledWith({ status: 'Backlog' })
  })

  it('tasks:create handler passes input to use case', () => {
    const input = {
      subjectId: 's1',
      title: 'X',
      taskType: 'Research',
      category: 'Finance',
      status: 'Backlog',
      priority: 'Normal'
    }
    captureHandler('tasks:create')?.({}, input)
    expect(mockCreate.execute).toHaveBeenCalledWith(input)
  })

  it('tasks:update handler passes id and input to use case', () => {
    captureHandler('tasks:update')?.({}, 't1', { title: 'Updated' })
    expect(mockUpdate.execute).toHaveBeenCalledWith('t1', { title: 'Updated' })
  })

  it('tasks:delete handler passes id to use case', () => {
    captureHandler('tasks:delete')?.({}, 't1')
    expect(mockDelete.execute).toHaveBeenCalledWith('t1')
  })
})
