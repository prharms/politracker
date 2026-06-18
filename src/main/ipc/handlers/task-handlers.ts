import { ipcMain } from 'electron'
import type { ListTasksUseCase } from '../../application/use-cases/tasks/list-tasks-use-case'
import type { CreateTaskUseCase } from '../../application/use-cases/tasks/create-task-use-case'
import type { UpdateTaskUseCase } from '../../application/use-cases/tasks/update-task-use-case'
import type { DeleteTaskUseCase } from '../../application/use-cases/tasks/delete-task-use-case'
import type { TaskListFilters, NewTaskInput, UpdateTaskInput } from '../../../shared/dtos/task-dto'

/** Register all task IPC handlers. */
export function registerTaskHandlers(
  listTasks: ListTasksUseCase,
  createTask: CreateTaskUseCase,
  updateTask: UpdateTaskUseCase,
  deleteTask: DeleteTaskUseCase
): void {
  ipcMain.handle('tasks:list', (_e, filters: TaskListFilters = {}) => listTasks.execute(filters))
  ipcMain.handle('tasks:create', (_e, input: NewTaskInput) => createTask.execute(input))
  ipcMain.handle('tasks:update', (_e, id: string, input: UpdateTaskInput) =>
    updateTask.execute(id, input)
  )
  ipcMain.handle('tasks:delete', (_e, id: string) => deleteTask.execute(id))
}
