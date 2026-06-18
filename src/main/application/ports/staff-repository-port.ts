import type { StaffDto, NewStaffInput } from '../../../shared/dtos/staff-dto'

/** Repository port for staff persistence. */
export interface StaffRepositoryPort {
  /** Return all staff records ordered by name. */
  listAll(): StaffDto[]

  /** Return a single staff record by id, or null if not found. */
  findById(id: string): StaffDto | null

  /** Persist a new staff record and return it. */
  create(input: NewStaffInput): StaffDto

  /** Update a staff member's active status and return the updated record. */
  updateStatus(id: string, status: 'Active' | 'Inactive'): StaffDto
}
