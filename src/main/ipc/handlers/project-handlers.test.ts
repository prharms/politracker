import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }))

import { ipcMain } from 'electron'
import { registerProjectHandlers } from './project-handlers'
import type { ListProjectsUseCase } from '../../application/use-cases/projects/list-projects-use-case'
import type { CreateProjectUseCase } from '../../application/use-cases/projects/create-project-use-case'
import type { UpdateProjectUseCase } from '../../application/use-cases/projects/update-project-use-case'
import type { DeleteProjectUseCase } from '../../application/use-cases/projects/delete-project-use-case'

const mockList = { execute: vi.fn().mockReturnValue([]) } as unknown as ListProjectsUseCase
const mockCreate = { execute: vi.fn().mockReturnValue({}) } as unknown as CreateProjectUseCase
const mockUpdate = { execute: vi.fn().mockReturnValue({}) } as unknown as UpdateProjectUseCase
const mockDelete = {
  execute: vi.fn().mockReturnValue({ deleted: true })
} as unknown as DeleteProjectUseCase

/** Extract the callback registered for a named channel. */
function captureHandler(channel: string) {
  const calls = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls
  const found = calls.find((c: unknown[]) => c[0] === channel)
  return found?.[1] as ((...args: unknown[]) => unknown) | undefined
}

describe('registerProjectHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    registerProjectHandlers(mockList, mockCreate, mockUpdate, mockDelete)
  })

  it('registers all four project IPC channels', () => {
    const channels = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0]
    )
    expect(channels).toContain('projects:list')
    expect(channels).toContain('projects:create')
    expect(channels).toContain('projects:update')
    expect(channels).toContain('projects:delete')
  })

  it('projects:list handler invokes use case', () => {
    captureHandler('projects:list')?.()
    expect(mockList.execute).toHaveBeenCalled()
  })

  it('projects:create handler passes input to use case', () => {
    const input = { clientId: 'c1', name: 'P', type: 'Candidate Campaign', status: 'Active' }
    captureHandler('projects:create')?.({}, input)
    expect(mockCreate.execute).toHaveBeenCalledWith(input)
  })

  it('projects:update handler passes id and input to use case', () => {
    const input = { name: 'Updated' }
    captureHandler('projects:update')?.({}, 'p1', input)
    expect(mockUpdate.execute).toHaveBeenCalledWith('p1', input)
  })

  it('projects:delete handler passes id to use case', () => {
    captureHandler('projects:delete')?.({}, 'p1')
    expect(mockDelete.execute).toHaveBeenCalledWith('p1')
  })
})
