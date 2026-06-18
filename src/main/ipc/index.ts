import { registerStaffHandlers } from './handlers/staff-handlers'
import { registerProjectHandlers } from './handlers/project-handlers'
import { registerTaskHandlers } from './handlers/task-handlers'
import type { ListStaffUseCase } from '../application/use-cases/staff/list-staff-use-case'
import type { CreateStaffUseCase } from '../application/use-cases/staff/create-staff-use-case'
import type { UpdateStaffStatusUseCase } from '../application/use-cases/staff/update-staff-status-use-case'
import type { ListProjectsUseCase } from '../application/use-cases/projects/list-projects-use-case'
import type { ListTasksUseCase } from '../application/use-cases/tasks/list-tasks-use-case'

/** Register all IPC handlers. Called once from src/main/index.ts at startup. */
export function registerAllHandlers(
  listStaff: ListStaffUseCase,
  createStaff: CreateStaffUseCase,
  updateStaffStatus: UpdateStaffStatusUseCase,
  listProjects: ListProjectsUseCase,
  listTasks: ListTasksUseCase
): void {
  registerStaffHandlers(listStaff, createStaff, updateStaffStatus)
  registerProjectHandlers(listProjects)
  registerTaskHandlers(listTasks)
}
