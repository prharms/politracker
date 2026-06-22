import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }))

import { ipcMain } from 'electron'
import { registerAllHandlers } from './index'
import type { ListSubprojectsUseCase } from '../application/use-cases/subprojects/list-subprojects-use-case'
import type { CreateSubprojectUseCase } from '../application/use-cases/subprojects/create-subproject-use-case'
import type { UpdateSubprojectUseCase } from '../application/use-cases/subprojects/update-subproject-use-case'
import type { DeleteSubprojectUseCase } from '../application/use-cases/subprojects/delete-subproject-use-case'
import type { ListStaffUseCase } from '../application/use-cases/staff/list-staff-use-case'
import type { CreateStaffUseCase } from '../application/use-cases/staff/create-staff-use-case'
import type { UpdateStaffUseCase } from '../application/use-cases/staff/update-staff-use-case'
import type { UpdateStaffStatusUseCase } from '../application/use-cases/staff/update-staff-status-use-case'
import type { DeleteStaffUseCase } from '../application/use-cases/staff/delete-staff-use-case'
import type { ListProjectsUseCase } from '../application/use-cases/projects/list-projects-use-case'
import type { CreateProjectUseCase } from '../application/use-cases/projects/create-project-use-case'
import type { UpdateProjectUseCase } from '../application/use-cases/projects/update-project-use-case'
import type { DeleteProjectUseCase } from '../application/use-cases/projects/delete-project-use-case'
import type { ListTasksUseCase } from '../application/use-cases/tasks/list-tasks-use-case'
import type { CreateTaskUseCase } from '../application/use-cases/tasks/create-task-use-case'
import type { UpdateTaskUseCase } from '../application/use-cases/tasks/update-task-use-case'
import type { DeleteTaskUseCase } from '../application/use-cases/tasks/delete-task-use-case'

const uc = <T>() => ({ execute: vi.fn() }) as unknown as T

describe('registerAllHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers handlers for all channels', () => {
    registerAllHandlers(
      uc<ListSubprojectsUseCase>(),
      uc<CreateSubprojectUseCase>(),
      uc<UpdateSubprojectUseCase>(),
      uc<DeleteSubprojectUseCase>(),
      uc<ListStaffUseCase>(),
      uc<CreateStaffUseCase>(),
      uc<UpdateStaffUseCase>(),
      uc<UpdateStaffStatusUseCase>(),
      uc<DeleteStaffUseCase>(),
      uc<ListProjectsUseCase>(),
      uc<CreateProjectUseCase>(),
      uc<UpdateProjectUseCase>(),
      uc<DeleteProjectUseCase>(),
      uc<ListTasksUseCase>(),
      uc<CreateTaskUseCase>(),
      uc<UpdateTaskUseCase>(),
      uc<DeleteTaskUseCase>()
    )
    const channels = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0]
    )
    expect(channels).toContain('subprojects:list')
    expect(channels).toContain('staff:list')
    expect(channels).toContain('projects:list')
    expect(channels).toContain('tasks:list')
    expect(channels).toContain('tasks:create')
    expect(channels).toContain('tasks:delete')
  })
})
