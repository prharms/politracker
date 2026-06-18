import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }))

import { ipcMain } from 'electron'
import { registerTaskHandlers } from './task-handlers'
import type { ListTasksUseCase } from '../../application/use-cases/tasks/list-tasks-use-case'

const mockUseCase = { execute: vi.fn().mockReturnValue([]) } as unknown as ListTasksUseCase

describe('registerTaskHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers the tasks:list handler', () => {
    registerTaskHandlers(mockUseCase)
    expect(ipcMain.handle).toHaveBeenCalledWith('tasks:list', expect.any(Function))
  })
})
