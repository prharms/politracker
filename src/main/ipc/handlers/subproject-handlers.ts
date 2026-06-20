import { ipcMain } from 'electron'
import type { ListSubprojectsUseCase } from '../../application/use-cases/subprojects/list-subprojects-use-case'
import type { CreateSubprojectUseCase } from '../../application/use-cases/subprojects/create-subproject-use-case'
import type { UpdateSubprojectUseCase } from '../../application/use-cases/subprojects/update-subproject-use-case'
import type { DeleteSubprojectUseCase } from '../../application/use-cases/subprojects/delete-subproject-use-case'
import type { NewSubprojectInput, UpdateSubprojectInput } from '../../../shared/dtos/subproject-dto'

/** Register IPC handlers for subproject CRUD operations. */
export function registerSubprojectHandlers(
  listUseCase: ListSubprojectsUseCase,
  createUseCase: CreateSubprojectUseCase,
  updateUseCase: UpdateSubprojectUseCase,
  deleteUseCase: DeleteSubprojectUseCase
): void {
  ipcMain.handle('subprojects:list', (_event, projectId?: string) => listUseCase.execute(projectId))

  ipcMain.handle('subprojects:create', (_event, input: NewSubprojectInput) =>
    createUseCase.execute(input)
  )

  ipcMain.handle('subprojects:update', (_event, id: string, input: UpdateSubprojectInput) =>
    updateUseCase.execute(id, input)
  )

  ipcMain.handle('subprojects:delete', (_event, id: string) => deleteUseCase.execute(id))
}
