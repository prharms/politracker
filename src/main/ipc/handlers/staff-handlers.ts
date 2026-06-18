import { ipcMain } from 'electron'
import type { ListStaffUseCase } from '../../application/use-cases/staff/list-staff-use-case'
import type { CreateStaffUseCase } from '../../application/use-cases/staff/create-staff-use-case'
import type { UpdateStaffUseCase } from '../../application/use-cases/staff/update-staff-use-case'
import type { UpdateStaffStatusUseCase } from '../../application/use-cases/staff/update-staff-status-use-case'
import type { DeleteStaffUseCase } from '../../application/use-cases/staff/delete-staff-use-case'
import type { NewStaffInput, UpdateStaffInput } from '../../../shared/dtos/staff-dto'

/** Register all staff IPC handlers. */
export function registerStaffHandlers(
  listStaff: ListStaffUseCase,
  createStaff: CreateStaffUseCase,
  updateStaff: UpdateStaffUseCase,
  updateStaffStatus: UpdateStaffStatusUseCase,
  deleteStaff: DeleteStaffUseCase
): void {
  ipcMain.handle('staff:list', () => listStaff.execute())
  ipcMain.handle('staff:create', (_e, input: NewStaffInput) => createStaff.execute(input))
  ipcMain.handle('staff:update', (_e, id: string, input: UpdateStaffInput) =>
    updateStaff.execute(id, input)
  )
  ipcMain.handle('staff:updateStatus', (_e, id: string, status: 'Active' | 'Inactive') =>
    updateStaffStatus.execute(id, status)
  )
  ipcMain.handle('staff:delete', (_e, id: string) => deleteStaff.execute(id))
}
