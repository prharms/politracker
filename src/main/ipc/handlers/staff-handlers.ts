import { ipcMain } from 'electron'
import type { ListStaffUseCase } from '../../application/use-cases/staff/list-staff-use-case'
import type { CreateStaffUseCase } from '../../application/use-cases/staff/create-staff-use-case'
import type { UpdateStaffStatusUseCase } from '../../application/use-cases/staff/update-staff-status-use-case'
import type { NewStaffInput } from '../../../shared/dtos/staff-dto'

/** Register all staff IPC handlers. */
export function registerStaffHandlers(
  listStaff: ListStaffUseCase,
  createStaff: CreateStaffUseCase,
  updateStaffStatus: UpdateStaffStatusUseCase
): void {
  ipcMain.handle('staff:list', () => listStaff.execute())
  ipcMain.handle('staff:create', (_event, input: NewStaffInput) => createStaff.execute(input))
  ipcMain.handle('staff:updateStatus', (_event, id: string, status: 'Active' | 'Inactive') =>
    updateStaffStatus.execute(id, status)
  )
}
