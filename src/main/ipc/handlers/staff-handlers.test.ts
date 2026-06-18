import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }))

import { ipcMain } from 'electron'
import { registerStaffHandlers } from './staff-handlers'
import type { ListStaffUseCase } from '../../application/use-cases/staff/list-staff-use-case'
import type { CreateStaffUseCase } from '../../application/use-cases/staff/create-staff-use-case'
import type { UpdateStaffStatusUseCase } from '../../application/use-cases/staff/update-staff-status-use-case'

const mockListStaff = { execute: vi.fn().mockReturnValue([]) } as unknown as ListStaffUseCase
const mockCreateStaff = { execute: vi.fn() } as unknown as CreateStaffUseCase
const mockUpdateStatus = { execute: vi.fn() } as unknown as UpdateStaffStatusUseCase

describe('registerStaffHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers staff:list, staff:create, and staff:updateStatus handlers', () => {
    registerStaffHandlers(mockListStaff, mockCreateStaff, mockUpdateStatus)
    const channels = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: unknown[]) => call[0]
    )
    expect(channels).toContain('staff:list')
    expect(channels).toContain('staff:create')
    expect(channels).toContain('staff:updateStatus')
  })
})
