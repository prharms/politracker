import type { StaffDto, NewStaffInput, UpdateStaffInput } from '../../../shared/dtos/staff-dto'

/** Repository port for staff persistence. */
export interface StaffRepositoryPort {
  /** Return all staff records ordered by name. */
  listAll(): StaffDto[]

  /** Return a single staff record by id, or null if not found. */
  findById(id: string): StaffDto | null

  /** Persist a new staff record and return it. */
  create(input: NewStaffInput): StaffDto

  /**
   * Update a staff member's name and/or initials and return the updated record.
   * @throws {StaffNotFoundError} if the staff member does not exist
   */
  update(id: string, input: UpdateStaffInput): StaffDto

  /**
   * Update a staff member's active status and return the updated record.
   * @throws {StaffNotFoundError} if the staff member does not exist
   */
  updateStatus(id: string, status: 'Active' | 'Inactive'): StaffDto

  /** Delete a staff member by id. */
  delete(id: string): void
}
