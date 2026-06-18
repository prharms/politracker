import { ipcMain } from 'electron'
import type { ListProjectsUseCase } from '../../application/use-cases/projects/list-projects-use-case'

/** Register all project IPC handlers. */
export function registerProjectHandlers(listProjects: ListProjectsUseCase): void {
  ipcMain.handle('projects:list', () => {
    return listProjects.execute()
  })
}
