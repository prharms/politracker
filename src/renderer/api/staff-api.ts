import type {
  StaffDto,
  NewStaffInput,
  UpdateStaffInput,
  DeleteStaffResult
} from '../../shared/dtos/staff-dto'

/** Fetch all staff records from the main process. */
export function apiListStaff(): Promise<StaffDto[]> {
  return window.api.staff.list()
}

/** Create a new staff member. */
export function apiCreateStaff(input: NewStaffInput): Promise<StaffDto> {
  return window.api.staff.create(input)
}

/** Update a staff member's name and/or initials. */
export function apiUpdateStaff(id: string, input: UpdateStaffInput): Promise<StaffDto> {
  return window.api.staff.update(id, input)
}

/** Toggle a staff member's active status. */
export function apiUpdateStaffStatus(id: string, status: 'Active' | 'Inactive'): Promise<StaffDto> {
  return window.api.staff.updateStatus(id, status)
}

/** Delete a staff member. */
export function apiDeleteStaff(id: string): Promise<DeleteStaffResult> {
  return window.api.staff.delete(id)
}
