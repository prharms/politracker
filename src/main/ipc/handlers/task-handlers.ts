import { ipcMain } from 'electron'
import type { ListTasksUseCase } from '../../application/use-cases/tasks/list-tasks-use-case'
import type { TaskListFilters } from '../../../shared/dtos/task-dto'

/** Register all task IPC handlers. */
export function registerTaskHandlers(listTasks: ListTasksUseCase): void {
  ipcMain.handle('tasks:list', (_event, filters: TaskListFilters = {}) => {
    return listTasks.execute(filters)
  })
}
