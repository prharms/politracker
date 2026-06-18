import { ipcMain } from 'electron'
import type { ListStaffUseCase } from '../../application/use-cases/staff/list-staff-use-case'

/** Register all staff IPC handlers. */
export function registerStaffHandlers(listStaff: ListStaffUseCase): void {
  ipcMain.handle('staff:list', () => {
    return listStaff.execute()
  })
}
