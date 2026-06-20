import { ipcMain } from 'electron'
import type { ListSubjectsUseCase } from '../../application/use-cases/subjects/list-subjects-use-case'
import type { CreateSubjectUseCase } from '../../application/use-cases/subjects/create-subject-use-case'
import type { UpdateSubjectUseCase } from '../../application/use-cases/subjects/update-subject-use-case'
import type { DeleteSubjectUseCase } from '../../application/use-cases/subjects/delete-subject-use-case'
import type { NewSubjectInput, UpdateSubjectInput } from '../../../shared/dtos/subject-dto'

/** Register all subject IPC handlers. */
export function registerSubjectHandlers(
  listSubjects: ListSubjectsUseCase,
  createSubject: CreateSubjectUseCase,
  updateSubject: UpdateSubjectUseCase,
  deleteSubject: DeleteSubjectUseCase
): void {
  ipcMain.handle('subjects:list', (_e, projectId?: string) => listSubjects.execute(projectId))
  ipcMain.handle('subjects:create', (_e, input: NewSubjectInput) => createSubject.execute(input))
  ipcMain.handle('subjects:update', (_e, id: string, input: UpdateSubjectInput) =>
    updateSubject.execute(id, input)
  )
  ipcMain.handle('subjects:delete', (_e, id: string) => deleteSubject.execute(id))
}
