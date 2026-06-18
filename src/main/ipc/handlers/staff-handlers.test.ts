import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }))

import { ipcMain } from 'electron'
import { registerStaffHandlers } from './staff-handlers'
import type { ListStaffUseCase } from '../../application/use-cases/staff/list-staff-use-case'

const mockUseCase = { execute: vi.fn().mockReturnValue([]) } as unknown as ListStaffUseCase

describe('registerStaffHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers the staff:list handler', () => {
    registerStaffHandlers(mockUseCase)
    expect(ipcMain.handle).toHaveBeenCalledWith('staff:list', expect.any(Function))
  })
})
