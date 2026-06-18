import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }))

import { ipcMain } from 'electron'
import { registerAllHandlers } from './index'
import type { ListStaffUseCase } from '../application/use-cases/staff/list-staff-use-case'
import type { CreateStaffUseCase } from '../application/use-cases/staff/create-staff-use-case'
import type { UpdateStaffStatusUseCase } from '../application/use-cases/staff/update-staff-status-use-case'
import type { ListProjectsUseCase } from '../application/use-cases/projects/list-projects-use-case'
import type { ListTasksUseCase } from '../application/use-cases/tasks/list-tasks-use-case'

const mockListStaff = { execute: vi.fn().mockReturnValue([]) } as unknown as ListStaffUseCase
const mockCreateStaff = { execute: vi.fn() } as unknown as CreateStaffUseCase
const mockUpdateStatus = { execute: vi.fn() } as unknown as UpdateStaffStatusUseCase
const mockListProjects = { execute: vi.fn().mockReturnValue([]) } as unknown as ListProjectsUseCase
const mockListTasks = { execute: vi.fn().mockReturnValue([]) } as unknown as ListTasksUseCase

describe('registerAllHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers handlers for all staff, project, and task channels', () => {
    registerAllHandlers(
      mockListStaff,
      mockCreateStaff,
      mockUpdateStatus,
      mockListProjects,
      mockListTasks
    )
    const channels = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: unknown[]) => call[0]
    )
    expect(channels).toContain('staff:list')
    expect(channels).toContain('staff:create')
    expect(channels).toContain('staff:updateStatus')
    expect(channels).toContain('projects:list')
    expect(channels).toContain('tasks:list')
  })
})
