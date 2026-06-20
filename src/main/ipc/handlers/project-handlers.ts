import { ipcMain } from 'electron'
import type { ListProjectsUseCase } from '../../application/use-cases/projects/list-projects-use-case'
import type { CreateProjectUseCase } from '../../application/use-cases/projects/create-project-use-case'
import type { UpdateProjectUseCase } from '../../application/use-cases/projects/update-project-use-case'
import type { DeleteProjectUseCase } from '../../application/use-cases/projects/delete-project-use-case'
import type { NewProjectInput, UpdateProjectInput } from '../../../shared/dtos/project-dto'

/** Register all project IPC handlers. */
export function registerProjectHandlers(
  listProjects: ListProjectsUseCase,
  createProject: CreateProjectUseCase,
  updateProject: UpdateProjectUseCase,
  deleteProject: DeleteProjectUseCase
): void {
  ipcMain.handle('projects:list', () => listProjects.execute())
  ipcMain.handle('projects:create', (_e, input: NewProjectInput) => createProject.execute(input))
  ipcMain.handle('projects:update', (_e, id: string, input: UpdateProjectInput) =>
    updateProject.execute(id, input)
  )
  ipcMain.handle('projects:delete', (_e, id: string) => deleteProject.execute(id))
}
