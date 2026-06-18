import type { StaffDto, NewStaffInput } from '../../shared/dtos/staff-dto'

/** Typed wrappers for staff IPC calls. */
export const staffApi = {
  /** Fetch all staff records. */
  list: (): Promise<StaffDto[]> => window.api.staff.list(),

  /** Create a new staff member. */
  create: (input: NewStaffInput): Promise<StaffDto> => window.api.staff.create(input),

  /** Update a staff member's active status. */
  updateStatus: (id: string, status: 'Active' | 'Inactive'): Promise<StaffDto> =>
    window.api.staff.updateStatus(id, status)
}
