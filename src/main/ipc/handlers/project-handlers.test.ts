import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }))

import { ipcMain } from 'electron'
import { registerProjectHandlers } from './project-handlers'
import type { ListProjectsUseCase } from '../../application/use-cases/projects/list-projects-use-case'

const mockUseCase = { execute: vi.fn().mockReturnValue([]) } as unknown as ListProjectsUseCase

describe('registerProjectHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers the projects:list handler', () => {
    registerProjectHandlers(mockUseCase)
    expect(ipcMain.handle).toHaveBeenCalledWith('projects:list', expect.any(Function))
  })
})
