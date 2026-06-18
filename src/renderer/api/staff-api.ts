import type { StaffDto } from '../../shared/dtos/staff-dto'

/** Typed wrappers for staff IPC calls. */
export const staffApi = {
  /** Fetch all staff records. */
  list: (): Promise<StaffDto[]> => window.api.staff.list()
}
